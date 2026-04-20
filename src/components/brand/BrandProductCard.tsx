"use client";

import { useState, memo } from "react";
import Image from "next/image";
import PairsWithSection from "./PairsWithSection";

interface BrandProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  storeName: string;
  vendor: string;
  productType: string;
  tags: string[];
}

export default memo(function BrandProductCard({
  name,
  price,
  imageUrl,
  productUrl,
  storeName,
  vendor,
  productType,
  tags,
}: BrandProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border transition-colors ${
        expanded ? "border-zinc-700 bg-zinc-900/80" : "border-zinc-900 bg-zinc-900/50 hover:border-zinc-700"
      }`}
    >
      {/* Clickable card area — expands pairings */}
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) setHasExpanded(true); }}
        aria-expanded={expanded}
        className="group text-left"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          {!imgError && imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-700">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <p className="line-clamp-2 text-xs font-medium text-zinc-200 sm:text-sm">{name}</p>
          {vendor !== storeName && (
            <p className="mt-0.5 text-[10px] text-zinc-600">{vendor}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-light text-white">${price.toFixed(0)}</span>
            <span className="text-[10px] text-zinc-600">
              {expanded ? "Tap to close" : "Tap to style"}
            </span>
          </div>
        </div>
      </button>

      {/* Shop link — always visible */}
      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mx-3 mb-3 block rounded-lg border border-zinc-800 py-2 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400 transition hover:border-zinc-600 hover:text-white sm:mx-4 sm:mb-4"
      >
        Shop →
      </a>

      {/* Pairings — stays mounted once expanded, hidden when collapsed */}
      <div className={expanded ? "border-t border-zinc-800 px-3 pb-3 pt-3 sm:px-4 sm:pb-4" : "hidden"}>
        {hasExpanded && (
          <PairsWithSection
            productName={name}
            productType={productType}
            tags={tags}
            storeName={storeName}
          />
        )}
      </div>
    </div>
  );
});
