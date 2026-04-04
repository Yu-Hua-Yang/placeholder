"use client";

import { useReducer, useCallback } from "react";
import type {
  WizardStep,
  WizardQuestion,
  WizardAnswer,
  BiometricResult,
  WizardRecommendedProduct,
  ProductFilterMode,
} from "@/lib/types";

export interface WizardState {
  currentStep: WizardStep;
  movementGoal: string;
  questions: WizardQuestion[];
  currentQuestionIndex: number;
  answers: WizardAnswer[];
  biometricImage: string | null;
  biometricResults: BiometricResult | null;
  products: WizardRecommendedProduct[];
  filterMode: ProductFilterMode;
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
  | { type: "SET_PRODUCTS"; products: WizardRecommendedProduct[] }
  | { type: "SET_FILTER_MODE"; mode: ProductFilterMode }
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
  products: [],
  filterMode: "technical",
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
      return { ...state, currentStep: "movement-goal" };

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

    case "SET_PRODUCTS":
      return { ...state, products: action.products, isLoading: false };

    case "SET_FILTER_MODE":
      return { ...state, filterMode: action.mode };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function useWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const submitBiometricImage = useCallback(
    async (image: string) => {
      dispatch({ type: "SET_BIOMETRIC_IMAGE", image });
      try {
        const res = await fetch("/api/wizard/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
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

  const submitMovementGoal = useCallback(
    async (goal: string) => {
      dispatch({ type: "SET_MOVEMENT_GOAL", goal });
      try {
        const body: Record<string, string> = { movementGoal: goal };
        if (state.biometricResults?.gender) {
          body.gender = state.biometricResults.gender;
        }
        if (state.biometricImage) {
          body.image = state.biometricImage;
        }
        const res = await fetch("/api/wizard/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        dispatch({ type: "SET_QUESTIONS", questions: data.questions });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to generate questions" });
      }
    },
    [state.biometricImage, state.biometricResults],
  );

  const answerQuestion = useCallback(
    (answer: WizardAnswer) => {
      dispatch({ type: "ANSWER_QUESTION", answer });
    },
    [],
  );

  // Fetch product recommendations — called as an effect when step becomes product-results
  const fetchProducts = useCallback(
    async (movementGoal: string, answers: WizardAnswer[], biometricResults: BiometricResult | null, biometricImage: string | null) => {
      try {
        const res = await fetch("/api/wizard/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movementGoal, answers, biometricResults, biometricImage }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        dispatch({ type: "SET_PRODUCTS", products: data.products });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to get recommendations" });
      }
    },
    [],
  );

  const setFilterMode = useCallback((mode: ProductFilterMode) => {
    dispatch({ type: "SET_FILTER_MODE", mode });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    submitBiometricImage,
    advanceToGoal,
    submitMovementGoal,
    answerQuestion,
    fetchProducts,
    setFilterMode,
    reset,
  };
}
