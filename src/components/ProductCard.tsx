"use client";

import { useState } from "react";
import type { RecommendedProduct } from "@/lib/types";

interface ProductCardProps {
  product: RecommendedProduct;
  isTopPick?: boolean;
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={
              star <= Math.round(rating)
                ? "text-black dark:text-white"
                : "text-zinc-300 dark:text-zinc-700"
            }
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-zinc-400">({reviewCount})</span>
    </div>
  );
}

export default function ProductCard({ product, isTopPick }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group overflow-hidden border bg-white transition-shadow hover:shadow-lg dark:bg-black ${
        isTopPick
          ? "border-black dark:border-white"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {isTopPick && (
        <div className="bg-black px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-white dark:bg-white dark:text-black">
          Top Pick
        </div>
      )}

      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-700">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-tight text-black dark:text-white">
            {product.name}
          </h3>
          <span className="shrink-0 text-sm font-bold text-black dark:text-white">
            ${product.price}
          </span>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="flex flex-wrap gap-1">
          {product.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {feature}
            </span>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {product.rationale}
        </p>

        <div className="flex flex-wrap gap-1">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
