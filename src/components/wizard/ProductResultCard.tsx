"use client";

import { useState } from "react";
import type { WizardRecommendedProduct } from "@/lib/types";

interface ProductResultCardProps {
  product: WizardRecommendedProduct;
  isTopPick?: boolean;
  archetype?: string;
}

export default function ProductResultCard({ product, isTopPick, archetype }: ProductResultCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const isPartner = product.source === "partner";
  const imageUrl = product.imageUrl || "";

  const hasArchetype = !!archetype;

  return (
    <div className={`group flex flex-col overflow-hidden border transition-colors ${
      isTopPick
        ? "border-white"
        : "border-zinc-900 hover:border-zinc-700"
    }`}>
      {/* Badge */}
      <div className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] ${
        isTopPick
          ? "bg-white text-black"
          : "bg-zinc-950 text-zinc-500"
      }`}>
        <span>
          {hasArchetype ? archetype : (isTopPick ? "Best Match" : "Match")}
          {!hasArchetype && ` — ${product.matchPercentage}%`}
        </span>
        {isPartner && !hasArchetype && (
          <span className="tracking-[0.15em] opacity-50">
            {product.partnerName}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
        {!imgError && imageUrl ? (
          <>
            {!imgLoaded && <div className="skeleton absolute inset-0" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-800">
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
          <h3 className="text-sm font-bold text-white">{product.name}</h3>
          <span className="shrink-0 text-sm font-bold text-white">${product.price}</span>
        </div>

        {hasArchetype && isPartner && (
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            {product.partnerName}
          </span>
        )}

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key}>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">{key} </span>
                <span className="text-xs font-semibold text-white">{value}</span>
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
                className="h-3.5 w-3.5 border border-zinc-800"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {product.rationale}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-zinc-900 px-4 py-2.5">
        {isPartner && product.productUrl ? (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white"
          >
            View on {product.partnerName}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : product.sizes.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">Sizes</span>
            {product.sizes.map((size) => (
              <span
                key={size}
                className="border border-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500"
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
