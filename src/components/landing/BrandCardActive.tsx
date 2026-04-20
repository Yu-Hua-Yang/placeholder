"use client";

import Link from "next/link";
import { slugify } from "@/lib/brand-utils";

interface BrandCardActiveProps {
  brandName: string;
  prompt: string;
  onStartWithGoal: (goal: string) => void;
}

export default function BrandCardActive({ brandName, prompt, onStartWithGoal }: BrandCardActiveProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-3 sm:p-5">
      <button
        type="button"
        onClick={() => onStartWithGoal(prompt)}
        className="group/btn flex w-full items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2.5 backdrop-blur-md transition-colors hover:border-white/50 hover:bg-black/60 sm:px-5 sm:py-3"
      >
        <span className="flex-1 truncate text-left text-[11px] text-white/70 sm:text-xs">{prompt}</span>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-black transition-colors group-hover/btn:bg-zinc-200 sm:px-4 sm:py-1.5 sm:text-[10px]">
          Go
        </span>
      </button>
      <Link
        href={`/brands/${slugify(brandName)}`}
        className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/50 transition-colors hover:text-white sm:text-[11px]"
      >
        Explore products →
      </Link>
    </div>
  );
}
