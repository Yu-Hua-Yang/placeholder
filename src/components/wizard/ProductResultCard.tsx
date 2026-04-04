"use client";

import { useState } from "react";
import type { WizardRecommendedProduct } from "@/lib/types";

interface ProductResultCardProps {
  product: WizardRecommendedProduct;
  isTopPick?: boolean;
}

export default function ProductResultCard({ product, isTopPick }: ProductResultCardProps) {
  const [imgError, setImgError] = useState(false);
  const isPartner = product.source === "partner";

  // Shopify CDN images work directly — no proxy needed
  const imageUrl = product.imageUrl || "";

  return (
    <div className={`group flex flex-col overflow-hidden border bg-white transition-shadow hover:shadow-lg dark:bg-black ${
      isTopPick
        ? "border-black dark:border-white"
        : "border-zinc-200 dark:border-zinc-800"
    }`}>
      {/* Match badge */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider ${
        isTopPick
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
      }`}>
        <span>{isTopPick ? "Best Match" : "Match"} – {product.matchPercentage}%</span>
        {isPartner && (
          <span className="text-[10px] tracking-widest opacity-60">
            {product.partnerName}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {!imgError && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
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

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-black dark:text-white">{product.name}</h3>
          <span className="shrink-0 text-sm font-bold text-black dark:text-white">${product.price}</span>
        </div>

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{key} </span>
                <span className="text-xs font-semibold text-black dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Colors */}
        {!isPartner && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <div
                key={color.name}
                title={color.name}
                className="h-4 w-4 rounded-full border border-zinc-200 dark:border-zinc-700"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {product.rationale}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
        {isPartner && product.productUrl ? (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:underline dark:text-white"
          >
            View on {product.partnerName}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : product.sizes.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sizes</span>
            {product.sizes.map((size) => (
              <span
                key={size}
                className="border border-zinc-200 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                {size}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
