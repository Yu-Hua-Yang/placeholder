import type { Product, ProductSearchQuery } from "./types";
import inventoryData from "@/data/inventory.json";

const inventory: Product[] = inventoryData as Product[];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesKeywords(product: Product, keywords: string): boolean {
  const tokens = tokenize(keywords);
  const searchable = `${product.name} ${product.description}`.toLowerCase();
  return tokens.every((token) => searchable.includes(token));
}

export function searchProducts(query: ProductSearchQuery): Product[] {
  const results = inventory.filter((product) => {
    if (!product.inStock) return false;

    if (query.categories?.length) {
      if (!query.categories.includes(product.category)) return false;
    }

    if (query.sports?.length) {
      if (!query.sports.includes(product.sport)) return false;
    }

    if (query.gender) {
      if (product.gender !== "unisex" && product.gender !== query.gender) return false;
    }

    if (query.features?.length) {
      const productFeatures = product.features.map((f) => f.toLowerCase());
      if (!query.features.some((f) => productFeatures.some((pf) => pf.includes(f.toLowerCase())))) return false;
    }

    if (query.colors?.length) {
      const productColors = product.colors.map((c) => c.name.toLowerCase());
      if (!query.colors.some((c) => productColors.includes(c.toLowerCase()))) return false;
    }

    if (query.priceRange) {
      if (query.priceRange.min !== undefined && product.price < query.priceRange.min) return false;
      if (query.priceRange.max !== undefined && product.price > query.priceRange.max) return false;
    }

    if (query.keywords) {
      if (!matchesKeywords(product, query.keywords)) return false;
    }

    return true;
  });

  // Sort by rating (descending), then reviewCount as tiebreaker
  results.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return results.slice(0, 25);
}
