/* ── Sleek phone mockups of the actual wizard UI ── */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px]">
      {/* Titanium bezel — thin border */}
      <div className="rounded-[32px] bg-zinc-900 p-[3px] shadow-xl shadow-black/10 ring-1 ring-white/10">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[29px] bg-zinc-950 aspect-[9/19.5]">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
            <div className="h-[10px] w-[52px] rounded-full bg-black ring-1 ring-zinc-800/50" />
          </div>
          {/* Status bar */}
          <div className="absolute top-1.5 left-4 z-10 text-[4px] font-semibold text-white/40">9:41</div>
          <div className="absolute top-1.5 right-4 z-10 flex items-center gap-1">
            {/* Signal bars */}
            <svg width="10" height="5" viewBox="0 0 20 10" className="text-white/40" fill="currentColor">
              <rect x="0" y="7" width="3" height="3" rx="0.5" />
              <rect x="5" y="5" width="3" height="5" rx="0.5" />
              <rect x="10" y="3" width="3" height="7" rx="0.5" />
              <rect x="15" y="0" width="3" height="10" rx="0.5" />
            </svg>
            {/* Battery */}
            <svg width="12" height="6" viewBox="0 0 28 13" className="text-white/40" fill="currentColor">
              <rect x="0" y="1" width="23" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="3" width="17" height="7" rx="1" />
              <rect x="24" y="4" width="3" height="5" rx="1" />
            </svg>
          </div>
          {/* Screen content */}
          <div className="relative h-full w-full pt-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanMockup() {
  return (
    <PhoneFrame>
      <div className="relative h-full w-full">
        {/* Camera background — richer gradient with depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-700/50 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />

        {/* Scan grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Corner brackets — glowing */}
        <div className="absolute inset-4 sm:inset-5">
          {[
            "top-0 left-0 border-t border-l",
            "top-0 right-0 border-t border-r",
            "bottom-0 left-0 border-b border-l",
            "bottom-0 right-0 border-b border-r",
          ].map((pos, idx) => (
            <div
              key={idx}
              className={`scan-bracket absolute h-4 w-4 ${pos} border-white/60`}
              style={{ animationDelay: `${idx * 0.4}s` }}
            />
          ))}
        </div>

        {/* Body guide silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 400"
            className="h-[50%] w-auto opacity-[0.1]"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="100" cy="42" rx="22" ry="28" />
            <line x1="92" y1="70" x2="92" y2="88" />
            <line x1="108" y1="70" x2="108" y2="88" />
            <line x1="92" y1="88" x2="46" y2="100" />
            <line x1="108" y1="88" x2="154" y2="100" />
            <line x1="46" y1="100" x2="56" y2="220" />
            <line x1="154" y1="100" x2="144" y2="220" />
            <line x1="56" y1="220" x2="64" y2="240" />
            <line x1="144" y1="220" x2="136" y2="240" />
            <line x1="64" y1="240" x2="70" y2="370" />
            <line x1="136" y1="240" x2="130" y2="370" />
            <line x1="70" y1="370" x2="58" y2="380" />
            <line x1="130" y1="370" x2="142" y2="380" />
            <line x1="46" y1="100" x2="28" y2="210" />
            <line x1="154" y1="100" x2="172" y2="210" />
            <line x1="28" y1="210" x2="24" y2="224" />
            <line x1="172" y1="210" x2="176" y2="224" />
          </svg>
        </div>

        {/* Scan line — animated sweep */}
        <div className="scan-line" />

        {/* Top HUD */}
        <div className="absolute top-5 left-3 right-3 flex items-start justify-between">
          <div>
            <div className="text-[5.5px] font-bold uppercase tracking-[0.2em] text-white/60">Body Scan</div>
            <div className="mt-0.5 text-[4.5px] text-white/30">Align with guide</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-emerald-400/80 mockup-pulse" />
            <span className="text-[4.5px] font-mono text-emerald-400/60">LIVE</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
          {/* Capture button — shutter style */}
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80">
            <div className="h-7 w-7 rounded-full bg-white" />
          </div>
          <div className="mt-0.5 rounded-md border border-white/15 py-1.5 text-center text-[5px] font-medium uppercase tracking-[0.15em] text-white/40">
            Upload Photo
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function TalkMockup() {
  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col px-4 pt-6">
        {/* Header area */}
        <div className="text-center mb-6">
          <h3 className="text-[8px] font-black uppercase tracking-tight text-white leading-tight">
            What are you<br />looking for?
          </h3>
          <p className="mt-1.5 text-[4.5px] leading-relaxed text-zinc-500">
            The more precise, the better your recs.
          </p>
        </div>

        {/* Input field with typing indicator */}
        <div className="w-full mb-5">
          <div className="flex items-center border-b border-zinc-700/80 pb-2">
            <div className="flex-1 flex items-center gap-1">
              <span className="text-[5.5px] text-white/70">Casual streetwear dr</span>
              <div className="h-2.5 w-px bg-white/60 mockup-pulse" />
            </div>
            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
              <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick pills — more visual */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Rick Owens dark look", active: false },
            { label: "Full Nike fit", active: false },
            { label: "Gym outfit", active: false },
            { label: "Streetwear drip", active: true },
          ].map((pill) => (
            <div
              key={pill.label}
              className={`rounded-full px-2.5 py-1 text-[4.5px] transition-colors ${
                pill.active
                  ? "bg-white text-black font-semibold"
                  : "border border-zinc-700/80 text-zinc-500"
              }`}
            >
              {pill.label}
            </div>
          ))}
        </div>

        {/* Bottom home indicator */}
        <div className="mt-auto pb-2 flex justify-center">
          <div className="h-[3px] w-10 rounded-full bg-white/15" />
        </div>
      </div>
    </PhoneFrame>
  );
}

function FitMockup() {
  const products = [
    { arch: "Essential", name: "Cotton Crew Tee", price: 89, color: "#3a3a3a" },
    { arch: "Statement", name: "Cargo Pants", price: 145, color: "#5c5040" },
    { arch: "Anchor", name: "Leather Jacket", price: 220, color: "#2a2520" },
    { arch: "Accent", name: "Canvas Sneakers", price: 65, color: "#6b6b6b" },
  ];

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col px-3 pt-4 pb-2">
        {/* Header */}
        <div className="mb-3 text-center">
          <span className="text-[4.5px] font-bold uppercase tracking-[0.25em] text-zinc-500">Your Results</span>
          <h3 className="mt-0.5 text-[10px] font-black uppercase tracking-tight text-white">10 Picks</h3>
        </div>

        {/* Product list */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-2 border-b border-zinc-800/60 py-2 last:border-b-0">
              {/* Product swatch */}
              <div
                className="h-7 w-7 shrink-0 rounded-md"
                style={{ backgroundColor: p.color }}
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[4px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  {p.arch}
                </div>
                <div className="text-[5px] font-semibold text-white truncate mt-0.5">
                  {p.name}
                </div>
              </div>
              {/* Price + arrow */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[5.5px] font-bold text-white">${p.price}</span>
                <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="opacity-30">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Color palette */}
        <div className="mt-auto pt-2.5 border-t border-zinc-800/60">
          <div className="text-[4px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-1.5">Your Palette</div>
          <div className="flex gap-[3px]">
            {[
              { color: "#2D2926", label: "Onyx" },
              { color: "#8B7355", label: "Umber" },
              { color: "#C4A882", label: "Sand" },
              { color: "#E8DDD3", label: "Ivory" },
              { color: "#556B63", label: "Sage" },
            ].map((swatch) => (
              <div key={swatch.color} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="h-4 w-full rounded-md"
                  style={{ backgroundColor: swatch.color }}
                />
                <span className="text-[3.5px] text-zinc-600">{swatch.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div className="pt-2 flex justify-center">
          <div className="h-[3px] w-10 rounded-full bg-white/15" />
        </div>
      </div>
    </PhoneFrame>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Talk",
    mockup: <TalkMockup />,
    desc: "How you move, what you like, what you need right now.",
  },
  {
    number: "02",
    title: "Snap",
    mockup: <ScanMockup />,
    desc: "Your build, proportions, and coloring — from a single photo.",
  },
  {
    number: "03",
    title: "Fit",
    mockup: <FitMockup />,
    desc: "Curated picks matched to your body — with exact sizing.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white px-5 py-20 sm:px-12 sm:py-36 lg:px-20">
      <div className="mx-auto max-w-6xl">
        {/* Minimal header */}
        <h2 className="text-3xl font-serif font-light text-zinc-900 sm:text-4xl lg:text-5xl">
          Three simple steps
        </h2>

        {/* Cards grid */}
        <div className="mt-12 grid grid-cols-1 gap-10 sm:mt-20 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="reveal group"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Mockup */}
              <div className="flex items-center justify-center py-4 transition-transform duration-500 group-hover:-translate-y-2">
                {step.mockup}
              </div>

              {/* Content */}
              <div className="mt-6 text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                  {step.number}
                </span>
                <h3 className="mt-1 text-lg font-serif font-light text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
