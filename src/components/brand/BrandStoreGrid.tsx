"use client";

import { useMemo, useState } from "react";
import type { NormalizedProduct } from "@/lib/shopify-stores";
import BrandProductCard from "./BrandProductCard";

interface BrandStoreGridProps {
  products: NormalizedProduct[];
}

type SortOption = "default" | "price-low" | "price-high";

export default function BrandStoreGrid({ products }: BrandStoreGridProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  // Filter and sort
  const filtered = useMemo(() => {
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.productType?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, sort]);

  return (
    <>
      {/* Search + Sort */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <label htmlFor="brand-search" className="sr-only">Search products</label>
          <input
            id="brand-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-2.5 pl-11 pr-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600"
          />
        </div>

        <label htmlFor="brand-sort" className="sr-only">Sort products</label>
        <select
          id="brand-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-full border border-zinc-800 bg-transparent px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-zinc-500 outline-none"
        >
          <option value="default">Sort</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High �� Low</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-zinc-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {filtered.map((product) => (
            <BrandProductCard
              key={product.productUrl}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              productUrl={product.productUrl}
              storeName={product.storeName}
              vendor={product.vendor}
              productType={product.productType}
              tags={product.tags}
            />
          ))}
        </div>
      )}
    </>
  );
}
