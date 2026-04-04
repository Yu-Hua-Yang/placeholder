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
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={
              star <= Math.round(rating)
                ? "text-amber-400"
                : "text-zinc-300 dark:text-zinc-600"
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
      className={`overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 ${
        isTopPick
          ? "border-amber-400 shadow-md dark:border-amber-500"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      {isTopPick && (
        <div className="bg-amber-400 px-3 py-1 text-center text-xs font-semibold text-amber-900">
          Top Pick
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            {product.name}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            ${product.price}
          </span>
        </div>

        {/* Rating */}
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1">
          {product.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Rationale */}
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {product.rationale}
        </p>

        {/* Sizes */}
        <div className="flex flex-wrap gap-1">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
