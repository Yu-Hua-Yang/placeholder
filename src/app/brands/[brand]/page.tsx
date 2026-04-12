"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { slugify } from "@/lib/brand-utils";
import type { NormalizedProduct } from "@/lib/shopify-stores";
import BrandStoreGrid from "@/components/brand/BrandStoreGrid";

export default function BrandStorePage() {
  const params = useParams<{ brand: string }>();
  const [vendor, setVendor] = useState<string | null>(null);
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // First resolve slug → vendor name
      const vendorsRes = await fetch("/api/brands/vendors");
      const { vendors } = await vendorsRes.json();
      const match = (vendors as string[]).find((v: string) => slugify(v) === params.brand);

      if (!match) {
        setVendor(null);
        setLoading(false);
        return;
      }

      setVendor(match);

      // Then fetch products for that vendor
      const productsRes = await fetch(`/api/brands/products?vendor=${encodeURIComponent(match)}`);
      const data = await productsRes.json();
      setProducts(data.products || []);
      setLoading(false);
    }

    load();
  }, [params.brand]);

  if (loading) {
    return (
      <main className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="skeleton h-12 w-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
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

  if (!vendor || products.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-serif font-light text-white sm:text-4xl">
          {vendor || "Brand"}
        </h1>
        <p className="mt-4 max-w-sm text-sm text-zinc-500">Coming soon.</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-light text-white sm:text-5xl lg:text-6xl">
            {vendor}
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            {products.length} products
          </p>
        </div>

        <BrandStoreGrid products={products} />
      </div>
    </main>
  );
}
