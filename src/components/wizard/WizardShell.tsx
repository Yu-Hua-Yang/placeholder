"use client";

import { useEffect, useRef } from "react";
import { useWizard } from "@/hooks/useWizard";
import HeaderBar from "./HeaderBar";
import MovementGoalStep from "./MovementGoalStep";
import QuestionCardStep from "./QuestionCardStep";
import BiometricScanStep from "./BiometricScanStep";
import ScanResultsStep from "./ScanResultsStep";
import ProductResultsStep from "./ProductResultsStep";

export default function WizardShell() {
  const {
    state,
    submitBiometricImage,
    advanceToGoal,
    submitMovementGoal,
    answerQuestion,
    fetchProducts,
    reset,
  } = useWizard();

  const fetchTriggered = useRef(false);
  useEffect(() => {
    if (state.currentStep === "product-results" && state.isLoading && !fetchTriggered.current) {
      fetchTriggered.current = true;
      fetchProducts(state.movementGoal, state.answers, state.biometricResults, state.biometricImage);
    }
    if (state.currentStep !== "product-results") {
      fetchTriggered.current = false;
    }
  }, [state.currentStep, state.isLoading, state.movementGoal, state.answers, state.biometricResults, state.biometricImage, fetchProducts]);

  const renderStep = () => {
    switch (state.currentStep) {
      case "biometric-scan":
        return <BiometricScanStep onCapture={submitBiometricImage} isLoading={state.isLoading} />;
      case "scan-results":
        return state.biometricResults ? (
          <ScanResultsStep
            biometricImage={state.biometricImage}
            results={state.biometricResults}
            onContinue={advanceToGoal}
            isLoading={state.isLoading}
          />
        ) : null;
      case "movement-goal":
        return <MovementGoalStep onSubmit={submitMovementGoal} isLoading={state.isLoading} />;
      case "questions":
        return (
          <QuestionCardStep
            questions={state.questions}
            currentQuestionIndex={state.currentQuestionIndex}
            answers={state.answers}
            onAnswer={answerQuestion}
            isLoading={state.isLoading}
          />
        );
      case "product-results":
        return <ProductResultsStep products={state.products} isLoading={state.isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white dark:bg-black">
      <HeaderBar onStartOver={reset} />

      {state.error && (
        <div className="mx-4 mt-2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:mx-6 sm:px-4 sm:py-3 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="animate-fade-in flex flex-1 flex-col" key={state.currentStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
