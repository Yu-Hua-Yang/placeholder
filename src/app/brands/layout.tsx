import Link from "next/link";

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-3 backdrop-blur-md sm:px-12 sm:py-4 lg:px-20">
        <Link href="/">
          <span className="text-xl font-serif font-light italic text-white sm:text-2xl">AuraFits</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/brands"
            className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 transition hover:text-white sm:text-xs"
          >
            Brands
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-black transition hover:bg-zinc-200 sm:px-6 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]"
          >
            Get Styled
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
