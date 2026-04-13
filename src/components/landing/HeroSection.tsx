"use client";

import { useState } from "react";
import Image from "next/image";

interface HeroSectionProps {
  onStartWithGoal: (goal: string) => void;
}

const QUICK_PILLS = [
  { label: "Date night", prompt: "Date night outfit — tailored slim-fit trousers, fitted knit or silk top, sleek leather shoes, understated jewelry, refined color palette that flatters my skin tone" },
  { label: "Everyday casual", prompt: "Everyday casual outfit — well-fitting tee or lightweight knit, tapered chinos or relaxed jeans, clean white sneakers, minimal accessories, neutral tones with one accent color" },
  { label: "Going out", prompt: "Going out outfit — statement jacket or bomber, fitted dark jeans or cargo pants, bold sneakers or boots, layered chains or rings, confident streetwear with high-low mix" },
  { label: "Gym fit", prompt: "Complete gym outfit for heavy lifting — compression top or fitted tank, training shorts or tapered joggers, supportive cross-trainers, breathable performance fabrics" },
  { label: "Work ready", prompt: "Professional work outfit — structured blazer, crisp button-down or mock neck, tailored trousers, polished leather shoes, modern business casual that moves well" },
  { label: "Weekend layers", prompt: "Relaxed weekend outfit — oversized hoodie or cardigan, comfortable joggers or loose-fit denim, retro sneakers, layered for warmth, cozy but put-together" },
];

const STATS = [
  { value: "10K+", label: "Outfits styled" },
  { value: "400+", label: "Premium brands" },
  { value: "98%", label: "Fit accuracy" },
];

export default function HeroSection({ onStartWithGoal }: HeroSectionProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (text) onStartWithGoal(text);
  };

  return (
    <section id="hero" className="relative h-[100dvh] w-full overflow-hidden bg-zinc-950">
      {/* Fashion imagery — moody editorial picks, hidden on mobile */}
      <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
        <div className="absolute -left-10 top-[8%] w-[340px] rotate-[-4deg] opacity-[0.15]">
          <Image src="/images/showcase-1.jpg" alt="" width={340} height={450} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
        <div className="absolute left-[12%] bottom-[6%] w-[260px] rotate-[3deg] opacity-[0.1]">
          <Image src="/images/showcase-4.jpg" alt="" width={260} height={350} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
        <div className="absolute -right-8 top-[5%] w-[320px] rotate-[5deg] opacity-[0.15]">
          <Image src="/images/showcase-3.jpg" alt="" width={320} height={430} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
        <div className="absolute right-[10%] bottom-[10%] w-[280px] rotate-[-3deg] opacity-[0.12]">
          <Image src="/images/step-snap.jpg" alt="" width={280} height={370} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
        <div className="absolute left-1/2 top-[18%] w-[400px] -translate-x-1/2 opacity-[0.06]">
          <Image src="/images/hero.jpg" alt="" width={400} height={530} className="rounded-lg object-cover" loading="lazy" quality={20} />
        </div>
      </div>

      {/* Dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(9,9,11,0.85) 70%, rgb(9,9,11) 100%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-zinc-600 sm:text-[11px]">
          Early access
        </p>

        {/* Headline */}
        <h1 className="mt-5">
          <span className="block text-4xl font-normal tracking-tight text-white sm:text-6xl lg:text-7xl">
            A stylist that
          </span>
          <span className="block font-serif font-light italic text-4xl text-white sm:text-6xl lg:text-7xl">
            actually gets you.
          </span>
        </h1>

        {/* Subtitle — explains what it does */}
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
          One photo of your body. A quick conversation about your style.
          Outfits picked from 400+ brands that actually fit.
        </p>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl mx-auto">
          <div className="relative rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm transition-colors focus-within:border-white focus-within:bg-zinc-900/80">
            <input
              id="hero-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you want to wear?"
              className="w-full bg-transparent py-4 pl-6 pr-28 text-base font-medium text-white outline-none placeholder:text-zinc-500 sm:text-lg sm:py-5 sm:pl-8 sm:pr-32"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black transition-all hover:bg-zinc-200 sm:px-6 sm:py-3 sm:text-[11px]"
              >
                Style me
              </button>
            </div>
          </div>
        </form>

        {/* Quick pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => onStartWithGoal(pill.prompt)}
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-[11px] text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-white sm:text-xs"
            >
              {pill.label}
            </button>
          ))}
        </div>
        <p className="mt-5 text-[10px] text-zinc-600">Takes 2 minutes. No signup required.</p>

        {/* Stats row */}
        <div className="mt-10 flex items-center gap-6 sm:gap-12">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6 sm:gap-12">
              {i > 0 && <div className="h-8 w-px bg-zinc-800" />}
              <div className="text-center">
                <p className="text-lg font-light text-white sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-zinc-600 sm:text-[10px] sm:tracking-[0.2em]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-zinc-600">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
