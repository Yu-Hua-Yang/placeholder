"use client";

import { useEffect, useRef, Component } from "react";
import type { ReactNode } from "react";
import { useWizard } from "@/hooks/useWizard";
import HeaderBar from "./HeaderBar";
import MovementGoalStep from "./MovementGoalStep";
import QuestionCardStep from "./QuestionCardStep";
import BiometricScanStep from "./BiometricScanStep";
import ScanResultsStep from "./ScanResultsStep";
import ProductResultsStep from "./ProductResultsStep";
import EmailGate from "./EmailGate";

class ErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <p className="text-lg font-medium text-zinc-400">Something went wrong.</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200"
          >
            Start over
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WizardShell() {
  const {
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
      case "email-gate":
        return <EmailGate onSubmit={submitEmail} />;
      case "movement-goal":
        return <MovementGoalStep onSubmit={submitMovementGoal} onPrefetch={prefetchQuestions} isLoading={state.isLoading} />;
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
        return (
          <ProductResultsStep
            result={state.recommendationResult}
            isLoading={state.isLoading}
            personalPalette={state.biometricResults?.personalPalette || []}
            onGenerateFitImage={generateFitImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <HeaderBar onStartOver={reset} />

      {state.error && (
        <div className="mx-6 mt-3 border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400 sm:mx-8">
          {state.error}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <ErrorBoundary onReset={reset}>
          <div className="animate-fade-in absolute inset-0 overflow-y-auto" key={state.currentStep}>
            {renderStep()}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
