"use client";

import { useState } from "react";
import type { WizardQuestion, WizardAnswer } from "@/lib/types";
import OptionButton from "./OptionButton";
import AnswerBadges from "./AnswerBadges";
import MeasuringMate from "./MeasuringMate";
import MascotBadge from "./MascotBadge";

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

  if (isLoading || !question) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 sm:px-8">
        <MascotBadge pose="run" size="lg" />
        <p className="max-w-md text-center text-lg font-medium text-zinc-500 dark:text-zinc-400">
          We&apos;ll be asking you a few extra questions to understand your needs the best
        </p>
        <div className="flex gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    );
  }

  const handleSelect = (value: string) => {
    if (value === "__other__") {
      setShowOtherInput(true);
      return;
    }
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
  };

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
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <MascotBadge pose="think" size="sm" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
        <div className="h-0.5 w-24 bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-black transition-all duration-500 ease-out dark:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
          <h2 className="mb-6 text-2xl font-black tracking-tight text-black sm:mb-10 sm:text-3xl dark:text-white">
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
                  className="flex-1 border-b-2 border-black bg-transparent px-1 py-3 text-lg font-semibold outline-none placeholder:text-zinc-300 dark:border-white dark:placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={!otherText.trim()}
                  className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition-opacity disabled:opacity-30 dark:text-white"
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
