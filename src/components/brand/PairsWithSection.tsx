"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PairProduct {
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  storeName: string;
  vendor: string;
}

interface PairsWithSectionProps {
  productName: string;
  productType: string;
  tags: string[];
  storeName: string;
}

export default function PairsWithSection({
  productName,
  productType,
  tags,
  storeName,
}: PairsWithSectionProps) {
  const [pairs, setPairs] = useState<PairProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPairs() {
      try {
        const res = await fetch("/api/brands/pairs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName, productType, tags, storeName }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPairs(data.pairs || []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchPairs();
    return () => { controller.abort(); };
  }, [productName, productType, tags, storeName]);

  if (loading) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">Finding pieces to pair...</p>
        <div className="mt-2 flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square w-20 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || pairs.length === 0) {
    return (
      <p className="text-[10px] text-zinc-700">No pairings available yet.</p>
    );
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">Goes great with</p>
      <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto">
        {pairs.map((pair) => (
          <a
            key={pair.productUrl}
            href={pair.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group w-20 flex-shrink-0 sm:w-24"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
              <Image
                src={pair.imageUrl}
                alt={pair.name}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-1 line-clamp-1 text-[9px] text-zinc-500 group-hover:text-zinc-300">
              {pair.name}
            </p>
            <p className="text-[9px] text-zinc-700">${pair.price.toFixed(0)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
