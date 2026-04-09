"use client";

import { useState } from "react";
import type { OutfitItem } from "@/lib/types";

interface OutfitItemCardProps {
  product: OutfitItem;
}

export default function OutfitItemCard({ product }: OutfitItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = product.imageUrl || "";

  return (
    <div className="flex items-center gap-4 border-b border-zinc-900 py-3 last:border-b-0">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-zinc-950 sm:h-24 sm:w-24">
        {!imgError && imageUrl ? (
          <>
            {!imgLoaded && <div className="skeleton absolute inset-0" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          {product.slot || "ITEM"}
        </span>
        <span className="truncate text-sm font-bold text-white">{product.name}</span>
        {product.colorDescription && (
          <span className="text-[10px] text-zinc-500">{product.colorDescription}</span>
        )}
      </div>

      {/* Price + Link */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold text-white">${product.price}</span>
        {product.productUrl && (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-white"
          >
            View
          </a>
        )}
      </div>
    </div>
  );
}
