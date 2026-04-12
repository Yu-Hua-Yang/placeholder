export default function BrandStoreLoading() {
  return (
    <main className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="skeleton h-12 w-64 rounded-lg" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-zinc-900">
              <div className="skeleton aspect-square" />
              <div className="p-4">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton mt-3 h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
