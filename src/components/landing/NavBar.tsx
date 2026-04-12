"use client";

import { useEffect, useState } from "react";

interface NavBarProps {
  onStart: () => void;
}

export default function NavBar({ onStart }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 sm:px-12 sm:py-4 lg:px-20 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-zinc-200"
          : "bg-transparent"
      }`}
    >
      {/* Left — logo */}
      <a href="#hero">
        <span
          className={`text-xl font-serif font-light italic transition sm:text-2xl ${
            scrolled ? "text-zinc-900" : "text-white"
          }`}
        >
          AuraFits
        </span>
      </a>

      {/* Right — links + CTA */}
      <div className="flex items-center gap-3 sm:gap-5">
        <a
          href="/brands"
          className={`text-[10px] font-medium uppercase tracking-[0.2em] transition sm:text-xs ${
            scrolled ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
          }`}
        >
          Brands
        </a>
        <button
          onClick={onStart}
          className={`rounded-full px-4 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] transition sm:px-6 sm:py-2 sm:text-[10px] sm:tracking-[0.2em] ${
            scrolled
              ? "bg-zinc-900 text-white hover:bg-zinc-700"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          Get Styled
        </button>
      </div>
    </nav>
  );
}
