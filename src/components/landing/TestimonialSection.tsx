function Star() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-accent"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}

export default function TestimonialSection() {
  return (
    <section className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} />
          ))}
        </div>

        <blockquote className="mt-8 text-xl font-serif font-light italic leading-relaxed text-zinc-900 sm:text-2xl">
          &ldquo;I uploaded one photo and got outfit recommendations that actually
          made sense for my body type. It felt like having a stylist who
          genuinely understood me.&rdquo;
        </blockquote>

        <p className="mt-6 text-sm text-zinc-500">&mdash; Early beta tester</p>
      </div>
    </section>
  );
}
