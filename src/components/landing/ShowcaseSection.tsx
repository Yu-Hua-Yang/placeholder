"use client";

import { useRef } from "react";
import Image from "next/image";

const CARDS = [
  {
    image: "/images/showcase-1.jpg",
    label: "Date Night",
    desc: "Elegant fits tailored to your frame and color season",
    prompt: "Date night outfit — tailored slim-fit trousers, fitted knit or silk top, sleek leather shoes, understated jewelry, refined color palette that flatters my skin tone",
  },
  {
    image: "/images/showcase-2.jpg",
    label: "Everyday Casual",
    desc: "Effortless pieces that actually fit your body",
    prompt: "Everyday casual outfit — well-fitting tee or lightweight knit, tapered chinos or relaxed jeans, clean white sneakers, minimal accessories, neutral tones with one accent color",
  },
  {
    image: "/images/showcase-3.jpg",
    label: "Going Out",
    desc: "Statement looks that complement your features",
    prompt: "Going out outfit — statement jacket or bomber, fitted dark jeans or cargo pants, bold sneakers or boots, layered chains or rings, confident streetwear with high-low mix",
  },
  {
    image: "/images/showcase-4.jpg",
    label: "Work Ready",
    desc: "Professional outfits matched to your build",
    prompt: "Professional work outfit — structured blazer, crisp button-down or mock neck, tailored trousers, polished leather shoes, modern business casual that moves well",
  },
  {
    image: "/images/showcase-5.jpg",
    label: "Weekend Vibes",
    desc: "Relaxed layers styled for your body type",
    prompt: "Relaxed weekend outfit — oversized hoodie or cardigan, comfortable joggers or loose-fit denim, retro sneakers, layered for warmth, cozy but put-together",
  },
  {
    image: "/images/showcase-6.jpg",
    label: "Vacation Style",
    desc: "Travel-ready looks curated just for you",
    prompt: "Vacation outfit — linen shirt or camp collar top, relaxed shorts or wide-leg pants, slip-on sandals or espadrilles, light breathable fabrics, warm earthy tones",
  },
];

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

interface ShowcaseSectionProps {
  onStartWithGoal: (goal: string) => void;
}

export default function ShowcaseSection({ onStartWithGoal }: ShowcaseSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-28 sm:py-36">
      {/* Header — minimal */}
      <div className="px-6 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-serif font-light text-zinc-900 sm:text-4xl lg:text-5xl">
            The edit
          </h2>
        </div>
      </div>

      {/* Scroller with arrows */}
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
          className="scrollbar-hide flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 sm:px-16"
        >
          {CARDS.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => onStartWithGoal(card.prompt)}
              className="group relative flex-shrink-0 w-[85vw] snap-center overflow-hidden rounded-2xl text-left cursor-pointer sm:w-80"
            >
              <div className="aspect-[3/5] sm:aspect-[3/4] relative">
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  sizes="(max-width: 640px) 85vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  quality={60}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white">
                    {card.label}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-300">{card.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/60 transition-colors group-hover:text-white sm:text-[11px]">
                    Style this look
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
