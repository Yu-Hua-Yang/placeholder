"use client";

import { useState } from "react";
import type { ArchetypeProduct, ColorPaletteEntry } from "@/lib/types";
import ProductResultCard from "./ProductResultCard";
import ColorPalette from "./ColorPalette";
import ShareButton from "./ShareCard";

interface TenPicksViewProps {
  category: string;
  products: ArchetypeProduct[];
  personalPalette: ColorPaletteEntry[];
}

function MobileProductCard({ product }: { product: ArchetypeProduct }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = product.imageUrl || "";

  return (
    <div className="flex items-start gap-4 border-b border-zinc-900 py-4 first:pt-0 last:border-b-0">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-zinc-950">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          {product.archetype}
        </span>
        <h3 className="truncate text-sm font-bold text-white">{product.name}</h3>
        {product.partnerName && (
          <span className="text-[10px] text-zinc-600">{product.partnerName}</span>
        )}
        <p className="line-clamp-1 text-[10px] text-zinc-500">{product.rationale}</p>
      </div>

      {/* Price + Link */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
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

export default function TenPicksView({ category, products, personalPalette }: TenPicksViewProps) {
  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-3xl">
              10 Picks
            </h2>
            <p className="mt-1 text-xs text-zinc-500 sm:mt-2 sm:text-sm">
              {category ? `Best ${category} for you` : "Curated selections"}
            </p>
          </div>
          <div className="hidden sm:block">
            <ColorPalette palette={personalPalette} title="Your Palette" compact />
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <>
          {/* Mobile: compact list */}
          <div className="flex flex-col sm:hidden">
            {products.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <ProductResultCard
                key={product.id}
                product={product}
                archetype={product.archetype}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-zinc-600">
          <p>No matching products found. Try a different movement goal.</p>
        </div>
      )}

      {/* Palette at bottom */}
      <div className="mt-6 sm:mt-8">
        <ColorPalette palette={personalPalette} title="Your Personal Palette" />
      </div>

      {/* Share */}
      <div className="mt-6 flex justify-center sm:mt-8">
        <ShareButton mode="ten-picks" category={category} products={products} personalPalette={personalPalette} />
      </div>
    </div>
  );
}
