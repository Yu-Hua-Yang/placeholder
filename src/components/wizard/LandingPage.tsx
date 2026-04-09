"use client";

import { useEffect } from "react";

interface LandingPageProps {
  onStart: () => void;
}

const STEPS = [
  {
    number: "01",
    title: "Snap",
    video: "/videos/step-snap.mp4",
    desc: "We read your build, proportions, and coloring.",
  },
  {
    number: "02",
    title: "Talk",
    video: "/videos/step-talk.mp4",
    desc: "Tell us how you move, what you like, what you need.",
  },
  {
    number: "03",
    title: "Fit",
    video: "/videos/step-fit.mp4",
    desc: "Curated picks matched to your body — with exact sizing.",
  },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black">
      {/* ── Hero ── */}
      <section className="relative h-screen w-screen overflow-hidden">
        <video
          src="/videos/fashion-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#c4a46c]">
            Your Personal Stylist
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tight text-white sm:text-7xl lg:text-8xl">
            AuraFits
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Your body. Your style. Perfectly matched&nbsp;&mdash;&nbsp;in&nbsp;seconds.
          </p>

          <button
            onClick={onStart}
            className="mt-10 border border-white/20 bg-white/5 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-sm transition-all hover:border-[#c4a46c] hover:bg-[#c4a46c]/10 hover:text-[#c4a46c]"
          >
            Start Session
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="reveal px-6 py-20 sm:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative aspect-[3/4] overflow-hidden border border-zinc-900"
            >
              <video
                src={step.video}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <span className="text-4xl font-black text-white/[0.06]">
                  {step.number}
                </span>
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#c4a46c]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center justify-center px-6 py-24">
        <button
          onClick={onStart}
          className="w-full max-w-md bg-[#c4a46c] py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-[#d4b47c]"
        >
          Start My Session
        </button>
      </section>
    </div>
  );
}
