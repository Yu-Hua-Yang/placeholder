import Image from "next/image";
import CTAButton from "./CTAButton";

interface FinalCTASectionProps {
  onStart: () => void;
}

export default function FinalCTASection({ onStart }: FinalCTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-5 py-20 text-center sm:px-6 sm:py-36">
      {/* Background fashion imagery */}
      <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
        <div className="absolute -left-6 top-[10%] w-[300px] rotate-[-5deg] opacity-[0.1]">
          <Image src="/images/showcase-1.jpg" alt="" width={300} height={400} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
        <div className="absolute -right-6 bottom-[5%] w-[320px] rotate-[4deg] opacity-[0.1]">
          <Image src="/images/showcase-3.jpg" alt="" width={320} height={430} className="rounded-lg object-cover" loading="lazy" quality={30} />
        </div>
      </div>

      {/* Vignette to keep center readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(9,9,11,0.9) 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-3xl font-serif font-light text-white sm:text-5xl lg:text-6xl">
          Ready to find your fit?
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-sm text-zinc-500">
          A quick scan. A short conversation. Outfits that actually work.
        </p>
        <CTAButton
          onClick={onStart}
          className="group mt-10 relative overflow-hidden bg-white px-10 py-4 text-[10px] font-medium uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-zinc-200 hover:tracking-[0.35em] sm:mt-12 sm:px-14"
        >
          Get Styled Free
          <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </CTAButton>
        <p className="mt-3 text-[10px] text-zinc-600">No signup. No credit card. Just outfits.</p>
      </div>
    </section>
  );
}
