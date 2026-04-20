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
const MAX_QUESTION_CACHE = 50;
const MAX_PENDING_FETCHES = 20;
const questionCache = new Map<string, WizardQuestion[]>();
const pendingFetches = new Map<string, Promise<WizardQuestion[] | null>>();

function boundedSet<K, V>(map: Map<K, V>, key: K, value: V, max: number) {
  if (map.has(key)) {
    map.delete(key); // re-insert moves it to end (most recent)
  } else if (map.size >= max) {
    // Evict least-recently-used entry (first key in Map iteration order)
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, value);
}

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
  currentStep: "movement-goal",
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
      return { ...state, email: action.email, currentStep: "questions", isLoading: true };

    case "SET_MOVEMENT_GOAL":
      return { ...state, movementGoal: action.goal, currentStep: "biometric-scan", error: null };

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

export function useWizard(initialGoal?: string) {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    ...(initialGoal ? { currentStep: "biometric-scan" as WizardStep, movementGoal: initialGoal } : {}),
  });

  const biometricAbortRef = useRef<AbortController | null>(null);
  const productsAbortRef = useRef<AbortController | null>(null);

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => {
      biometricAbortRef.current?.abort();
      productsAbortRef.current?.abort();
    };
  }, []);

  // Pre-warm the product cache on mount
  useEffect(() => {
    fetch("/api/wizard/warmup", { method: "POST" }).catch(() => {});
  }, []);

  const submitBiometricImage = useCallback(
    async (image: string) => {
      biometricAbortRef.current?.abort();
      const controller = new AbortController();
      biometricAbortRef.current = controller;

      dispatch({ type: "SET_BIOMETRIC_IMAGE", image });
      try {
        const res = await fetch("/api/wizard/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
        if (!controller.signal.aborted) {
          dispatch({ type: "SET_BIOMETRIC_RESULTS", results: data.results });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
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
      // Include biometric gender in cache key so pre-biometric prefetch
      // doesn't poison the cache for post-biometric fetches
      const gender = state.biometricResults?.gender || "";
      const cacheKey = `${goal}::${gender}`;

      // Check cache first
      const cached = questionCache.get(cacheKey);
      if (cached) return cached;

      // Check if already fetching
      const pending = pendingFetches.get(cacheKey);
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
          pendingFetches.delete(cacheKey);
          if (data?.questions) {
            boundedSet(questionCache, cacheKey, data.questions, MAX_QUESTION_CACHE);
            return data.questions as WizardQuestion[];
          }
          return null;
        })
        .catch(() => {
          pendingFetches.delete(cacheKey);
          return null;
        });

      boundedSet(pendingFetches, cacheKey, promise, MAX_PENDING_FETCHES);
      return promise;
    },
    [state.biometricImage, state.biometricResults],
  );

  // Prefetch questions for a goal (fire-and-forget, no state changes)
  const prefetchQuestions = useCallback(
    (goal: string) => {
      const trimmed = goal.trim();
      const gender = state.biometricResults?.gender || "";
      const cacheKey = `${trimmed}::${gender}`;
      if (!trimmed || questionCache.has(cacheKey) || pendingFetches.has(cacheKey)) return;
      fetchQuestionsForGoal(trimmed);
    },
    [fetchQuestionsForGoal, state.biometricResults],
  );

  const submitMovementGoal = useCallback(
    (goal: string) => {
      dispatch({ type: "SET_MOVEMENT_GOAL", goal });
    },
    [],
  );

  const answerQuestion = useCallback(
    (answer: WizardAnswer) => {
      dispatch({ type: "ANSWER_QUESTION", answer });
    },
    [],
  );

  const fetchProducts = useCallback(
    async (movementGoal: string, answers: WizardAnswer[], biometricResults: BiometricResult | null, biometricImage: string | null) => {
      productsAbortRef.current?.abort();
      const controller = new AbortController();
      productsAbortRef.current = controller;

      try {
        const res = await fetch("/api/wizard/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movementGoal, answers, biometricResults, biometricImage }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: RecommendationResult = await res.json();
        if (!controller.signal.aborted) {
          dispatch({ type: "SET_RECOMMENDATION_RESULT", result: data });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
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

      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
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
          if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          const img = await res.json();
          if (img.imageBase64) {
            dispatch({ type: "SET_FIT_IMAGE", fitIndex, imageBase64: img.imageBase64 });
          }
          break;
        } catch {
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          // Final failure is non-critical
        }
      }
    },
    [state.recommendationResult, state.biometricImage, state.biometricResults],
  );

  const submitEmail = useCallback(async (email: string) => {
    dispatch({ type: "SET_EMAIL", email });
    // Persist to backend (fire and forget)
    fetch("/api/collect-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    try { sessionStorage.setItem("aurafits_email", email); } catch {}

    // Fetch questions now that biometric data is available
    try {
      const questions = await fetchQuestionsForGoal(state.movementGoal);
      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate questions");
      }
      dispatch({ type: "SET_QUESTIONS", questions });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to generate questions" });
    }
  }, [fetchQuestionsForGoal, state.movementGoal]);

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
