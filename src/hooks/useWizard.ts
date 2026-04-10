"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  WizardStep,
  WizardQuestion,
  WizardAnswer,
  BiometricResult,
  RecommendationResult,
} from "@/lib/types";

// Question cache — keyed by goal string, shared across renders
const questionCache = new Map<string, WizardQuestion[]>();
const pendingFetches = new Map<string, Promise<WizardQuestion[] | null>>();

export interface WizardState {
  currentStep: WizardStep;
  movementGoal: string;
  questions: WizardQuestion[];
  currentQuestionIndex: number;
  answers: WizardAnswer[];
  biometricImage: string | null;
  biometricResults: BiometricResult | null;
  recommendationResult: RecommendationResult | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;
}

type WizardAction =
  | { type: "SET_MOVEMENT_GOAL"; goal: string }
  | { type: "SET_QUESTIONS"; questions: WizardQuestion[] }
  | { type: "ANSWER_QUESTION"; answer: WizardAnswer }
  | { type: "SET_BIOMETRIC_IMAGE"; image: string }
  | { type: "SET_BIOMETRIC_RESULTS"; results: BiometricResult }
  | { type: "ADVANCE_TO_GOAL" }
  | { type: "ADVANCE_TO_PRODUCTS" }
  | { type: "SET_RECOMMENDATION_RESULT"; result: RecommendationResult }
  | { type: "SET_FIT_IMAGE"; fitIndex: number; imageBase64: string }
  | { type: "SET_EMAIL"; email: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const initialState: WizardState = {
  currentStep: "biometric-scan",
  movementGoal: "",
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  biometricImage: null,
  biometricResults: null,
  recommendationResult: null,
  email: null,
  isLoading: false,
  error: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_BIOMETRIC_IMAGE":
      return { ...state, biometricImage: action.image, isLoading: true, error: null };

    case "SET_BIOMETRIC_RESULTS":
      return { ...state, biometricResults: action.results, currentStep: "scan-results", isLoading: false };

    case "ADVANCE_TO_GOAL":
      return { ...state, currentStep: "email-gate" };

    case "SET_EMAIL":
      return { ...state, email: action.email, currentStep: "movement-goal" };

    case "SET_MOVEMENT_GOAL":
      return { ...state, movementGoal: action.goal, currentStep: "questions", isLoading: true, error: null };

    case "SET_QUESTIONS":
      return { ...state, questions: action.questions, isLoading: false };

    case "ANSWER_QUESTION": {
      const answers = [...state.answers, action.answer];
      const nextIndex = state.currentQuestionIndex + 1;
      const allDone = nextIndex >= state.questions.length;
      return {
        ...state,
        answers,
        currentQuestionIndex: nextIndex,
        currentStep: allDone ? "product-results" : state.currentStep,
        isLoading: allDone,
      };
    }

    case "ADVANCE_TO_PRODUCTS":
      return { ...state, currentStep: "product-results", isLoading: true, error: null };

    case "SET_RECOMMENDATION_RESULT":
      return { ...state, recommendationResult: action.result, isLoading: false };

    case "SET_FIT_IMAGE": {
      if (!state.recommendationResult || state.recommendationResult.mode !== "two-fits") return state;
      const fits = state.recommendationResult.fits.map((fit, i) =>
        i === action.fitIndex ? { ...fit, generatedImageBase64: action.imageBase64 } : fit,
      );
      return {
        ...state,
        recommendationResult: { mode: "two-fits", fits },
      };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
        // Reset image so camera restarts on biometric scan errors
        biometricImage: state.currentStep === "biometric-scan" ? null : state.biometricImage,
      };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function useWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Pre-warm the product cache on mount
  useEffect(() => {
    fetch("/api/wizard/warmup", { method: "POST" }).catch(() => {});
  }, []);

  const submitBiometricImage = useCallback(
    async (image: string) => {
      dispatch({ type: "SET_BIOMETRIC_IMAGE", image });
      try {
        const res = await fetch("/api/wizard/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
        dispatch({ type: "SET_BIOMETRIC_RESULTS", results: data.results });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to analyze image" });
      }
    },
    [],
  );

  const advanceToGoal = useCallback(() => {
    dispatch({ type: "ADVANCE_TO_GOAL" });
  }, []);

  const fetchQuestionsForGoal = useCallback(
    async (goal: string): Promise<WizardQuestion[] | null> => {
      // Check cache first
      const cached = questionCache.get(goal);
      if (cached) return cached;

      // Check if already fetching
      const pending = pendingFetches.get(goal);
      if (pending) return pending;

      const body: Record<string, string> = { movementGoal: goal };
      if (state.biometricResults?.gender) body.gender = state.biometricResults.gender;
      if (state.biometricImage) body.image = state.biometricImage;

      const promise = fetch("/api/wizard/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => {
          pendingFetches.delete(goal);
          if (data?.questions) {
            questionCache.set(goal, data.questions);
            return data.questions as WizardQuestion[];
          }
          return null;
        })
        .catch(() => {
          pendingFetches.delete(goal);
          return null;
        });

      pendingFetches.set(goal, promise);
      return promise;
    },
    [state.biometricImage, state.biometricResults],
  );

  // Prefetch questions for a goal (fire-and-forget, no state changes)
  const prefetchQuestions = useCallback(
    (goal: string) => {
      const trimmed = goal.trim();
      if (!trimmed || questionCache.has(trimmed) || pendingFetches.has(trimmed)) return;
      fetchQuestionsForGoal(trimmed);
    },
    [fetchQuestionsForGoal],
  );

  const submitMovementGoal = useCallback(
    async (goal: string) => {
      dispatch({ type: "SET_MOVEMENT_GOAL", goal });
      try {
        const questions = await fetchQuestionsForGoal(goal);
        if (!questions || questions.length === 0) {
          throw new Error("Failed to generate questions");
        }
        dispatch({ type: "SET_QUESTIONS", questions });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to generate questions" });
      }
    },
    [fetchQuestionsForGoal],
  );

  const answerQuestion = useCallback(
    (answer: WizardAnswer) => {
      dispatch({ type: "ANSWER_QUESTION", answer });
    },
    [],
  );

  const fetchProducts = useCallback(
    async (movementGoal: string, answers: WizardAnswer[], biometricResults: BiometricResult | null, biometricImage: string | null) => {
      try {
        const res = await fetch("/api/wizard/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movementGoal, answers, biometricResults, biometricImage }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: RecommendationResult = await res.json();
        dispatch({ type: "SET_RECOMMENDATION_RESULT", result: data });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to get recommendations" });
      }
    },
    [],
  );

  const generateFitImage = useCallback(
    async (fitIndex: number) => {
      const result = state.recommendationResult;
      if (!result || result.mode !== "two-fits" || !state.biometricImage) return;
      const fit = result.fits[fitIndex];
      if (!fit || fit.generatedImageBase64) return; // already generated

      try {
        const res = await fetch("/api/wizard/outfit-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fitName: fit.name,
            fitVibe: fit.vibe,
            colorPalette: fit.colorPalette,
            items: fit.items,
            biometricResults: state.biometricResults,
            biometricImage: state.biometricImage,
          }),
        });
        const img = await res.json();
        if (img.imageBase64) {
          dispatch({ type: "SET_FIT_IMAGE", fitIndex, imageBase64: img.imageBase64 });
        }
      } catch {
        // Image gen failure is non-critical
      }
    },
    [state.recommendationResult, state.biometricImage, state.biometricResults],
  );

  const submitEmail = useCallback((email: string) => {
    dispatch({ type: "SET_EMAIL", email });
    // Persist to backend (fire and forget)
    fetch("/api/collect-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    try { sessionStorage.setItem("aurafits_email", email); } catch {}
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    submitBiometricImage,
    advanceToGoal,
    submitMovementGoal,
    submitEmail,
    prefetchQuestions,
    answerQuestion,
    fetchProducts,
    generateFitImage,
    reset,
  };
}
