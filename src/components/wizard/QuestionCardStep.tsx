"use client";

import { useState, useCallback } from "react";
import type { WizardQuestion, WizardAnswer } from "@/lib/types";
import OptionButton from "./OptionButton";
import AnswerBadges from "./AnswerBadges";
import ProductTeaser from "./ProductTeaser";

interface QuestionCardStepProps {
  questions: WizardQuestion[];
  currentQuestionIndex: number;
  answers: WizardAnswer[];
  onAnswer: (answer: WizardAnswer) => void;
  isLoading: boolean;
}

export default function QuestionCardStep({
  questions,
  currentQuestionIndex,
  answers,
  onAnswer,
  isLoading,
}: QuestionCardStepProps) {
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const question = questions[currentQuestionIndex];

  const handleSelect = useCallback((value: string) => {
    if (value === "__other__") {
      setShowOtherInput(true);
      return;
    }
    if (!question) return;
    const selected = question.options.find((o) => o.value === value);
    if (!selected) return;
    setShowOtherInput(false);
    setOtherText("");
    onAnswer({
      questionId: question.id,
      questionText: question.questionText,
      selectedLabel: selected.label,
      selectedValue: selected.value,
    });
  }, [question, onAnswer]);

  if (isLoading || !question) {
    return (
      <div className="flex h-full flex-col">
        {/* Loading bar */}
        <div className="shrink-0 border-b border-zinc-900 bg-black px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Generating questions
            </span>
          </div>
        </div>

        {/* Product ad */}
        <div className="relative min-h-0 flex-1 sm:p-4">
          <div className="relative mx-auto h-full w-full overflow-hidden bg-zinc-950 sm:max-w-lg">
            <ProductTeaser className="absolute inset-0" />
          </div>
        </div>
      </div>
    );
  }

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = otherText.trim();
    if (!text) return;
    setShowOtherInput(false);
    setOtherText("");
    onAnswer({
      questionId: question.id,
      questionText: question.questionText,
      selectedLabel: text,
      selectedValue: text,
    });
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">
      {/* Top bar */}
      <div className="mb-8 flex items-center gap-4 sm:mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
        <div className="h-px w-24 bg-zinc-800">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
          <h2 className="mb-8 text-2xl font-black tracking-tight text-white sm:mb-10 sm:text-3xl">
            {question.questionText}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                value={option.value}
                onSelect={handleSelect}
              />
            ))}
            {/* Other — custom input */}
            {!showOtherInput ? (
              <OptionButton
                label="Other"
                value="__other__"
                onSelect={handleSelect}
              />
            ) : (
              <form onSubmit={handleOtherSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Type your answer..."
                  autoFocus
                  className="flex-1 border-b border-white bg-transparent px-1 py-3 text-lg font-semibold text-white outline-none placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  disabled={!otherText.trim()}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity disabled:opacity-30"
                >
                  Next
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AnswerBadges answers={answers} />
      </div>
    </div>
  );
}
