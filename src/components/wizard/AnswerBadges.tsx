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
          className="border border-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500"
        >
          {answer.selectedLabel}
        </span>
      ))}
    </div>
  );
}
