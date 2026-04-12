import Link from "next/link";

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20">
        <Link
          href="/brands"
          className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 transition hover:text-white"
        >
          Brands
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="text-2xl font-serif font-light italic text-white">AuraFits</span>
        </Link>
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
        >
          Get Styled
        </Link>
      </nav>
      {children}
    </div>
  );
}
