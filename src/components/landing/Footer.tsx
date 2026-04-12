"use client";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-200 bg-white px-5 py-12 sm:px-12 sm:py-16 lg:px-20">
      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span className="text-[120px] font-serif font-light italic text-zinc-900 opacity-[0.03] sm:text-[180px]">
          AuraFits
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div>
            <span className="text-2xl font-serif font-light italic text-zinc-900">
              AuraFits
            </span>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 sm:gap-16">
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                Product
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#how-it-works" className="text-sm text-zinc-500 transition hover:text-zinc-900">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#hero" className="text-sm text-zinc-500 transition hover:text-zinc-900">
                    Start Session
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="/privacy" className="text-sm text-zinc-500 transition hover:text-zinc-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-zinc-500 transition hover:text-zinc-900">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex items-center justify-between border-t border-zinc-200 pt-8">
          <p className="text-xs text-zinc-400">&copy; 2026 AuraFits</p>
          <a
            href="https://instagram.com/aurafits.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition hover:text-zinc-900"
            aria-label="Follow on Instagram"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
