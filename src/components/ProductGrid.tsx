"use client";

import type { RecommendedProduct } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: RecommendedProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const sorted = [...products].sort((a, b) => a.rank - b.rank);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sorted.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isTopPick={product.rank === 1}
        />
      ))}
    </div>
  );
}
