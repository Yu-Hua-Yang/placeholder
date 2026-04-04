"use client";

import type { WizardAnswer } from "@/lib/types";

interface AnswerBadgesProps {
  answers: WizardAnswer[];
}

export default function AnswerBadges({ answers }: AnswerBadgesProps) {
  if (answers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {answers.map((answer) => (
        <span
          key={answer.questionId}
          className="border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
        >
          {answer.selectedLabel}
        </span>
      ))}
    </div>
  );
}
