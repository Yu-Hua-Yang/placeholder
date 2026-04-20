"use client";

import { useState, useEffect, useRef } from "react";

interface TeaserProduct {
  name: string;
  price: number;
  imageUrl: string;
  storeName: string;
  description: string;
}

interface ProductTeaserProps {
  className?: string;
}

let cachedProducts: TeaserProduct[] | null = null;
let fetchPromise: Promise<TeaserProduct[]> | null = null;

export function prefetchTeasers() {
  fetchTeasers();
}

function fetchTeasers(): Promise<TeaserProduct[]> {
  if (cachedProducts) return Promise.resolve(cachedProducts);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/wizard/teasers")
    .then((r) => r.json())
    .then((data) => {
      const products = data.products || [];
      cachedProducts = products;
      fetchPromise = null;
      return products;
    })
    .catch(() => {
      fetchPromise = null;
      return [];
    });

  return fetchPromise;
}

export default function ProductTeaser({ className = "" }: ProductTeaserProps) {
  const [products, setProducts] = useState<TeaserProduct[]>(cachedProducts || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [nextReady, setNextReady] = useState(true);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (products.length > 0 || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTeasers().then((p) => {
      if (p.length > 0) setProducts(p);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIdx = (prev + 1) % products.length;

        // Preload next image before transitioning
        const img = new window.Image();
        preloadRef.current = img;
        img.onload = () => {
          setPrevIndex(prev);
          setNextReady(true);
        };
        img.onerror = () => {
          setPrevIndex(prev);
          setNextReady(true);
        };
        setNextReady(false);
        img.src = products[nextIdx].imageUrl;

        return nextIdx;
      });
    }, 3500);
    return () => {
      clearInterval(interval);
      if (preloadRef.current) {
        preloadRef.current.onload = null;
        preloadRef.current.onerror = null;
        preloadRef.current.src = "";
        preloadRef.current = null;
      }
    };
  }, [products.length]);

  const product = products[activeIndex];
  const prevProduct = products[prevIndex];

  return (
    <div className={`bg-zinc-950 ${className}`}>
      {product ? (
        <>
          {/* Previous image — stays visible as fallback */}
          {prevProduct && prevIndex !== activeIndex && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={prevProduct.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-contain p-8"
              style={{ backgroundColor: "#f5f5f5" }}
            />
          )}

          {/* Current image — fades in on top */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-contain p-8 transition-opacity duration-700 ${nextReady ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: "#f5f5f5" }}
          />

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

          {/* Story progress bars */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3">
            {products.slice(0, 10).map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden bg-white/20">
                <div
                  className={`h-full bg-white transition-all ${
                    i < activeIndex
                      ? "w-full"
                      : i === activeIndex
                        ? "w-full duration-[3500ms] ease-linear"
                        : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Store badge — top */}
          <div className="absolute top-6 left-0 right-0 px-4">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/50">
              {product.storeName}
            </span>
          </div>

          {/* Product info — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="mb-1 inline-block text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">
              You might like
            </span>
            <h3 className="mb-1 text-sm font-black uppercase leading-tight text-white">
              {product.name}
            </h3>
            {product.description && (
              <p className="mb-2 line-clamp-2 text-[10px] leading-relaxed text-white/50">
                {product.description}
              </p>
            )}
            <span className="text-xs font-bold text-white">${product.price}</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
          <div className="skeleton mb-2 h-3 w-24" />
          <div className="skeleton h-2 w-16" />
        </div>
      )}
    </div>
  );
}
