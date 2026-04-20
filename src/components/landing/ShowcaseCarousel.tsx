"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

function ArrowLeft() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function ShowcaseCarousel({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? 320;
    const gap = 16; // gap-4 = 1rem = 16px
    const distance = cardWidth + gap;
    container.scrollBy({
      left: dir === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-12">
      {/* Arrows — desktop only */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-3 text-zinc-600 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 sm:block"
        aria-label="Scroll left"
      >
        <ArrowLeft />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-3 text-zinc-600 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 sm:block"
        aria-label="Scroll right"
      >
        <ArrowRight />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto snap-x snap-proximity pr-16 pl-6 pb-4 sm:px-16 will-change-scroll"
      >
        {children}
      </div>
    </div>
  );
}
