import { NextResponse } from "next/server";
import { queryProducts } from "@/lib/vector-store";

interface TeaserProduct {
  name: string;
  price: number;
  imageUrl: string;
  storeName: string;
  description: string;
}

let teaserCache: { products: TeaserProduct[]; expires: number } | null = null;

export async function GET() {
  if (teaserCache && teaserCache.expires > Date.now()) {
    return NextResponse.json({ products: teaserCache.products });
  }

  try {
    // Pull diverse products from the vector index using broad queries
    const queries = ["popular athletic shoes", "stylish gym apparel", "outdoor accessories", "streetwear sneakers"];
    const pick = queries[Math.floor(Math.random() * queries.length)];
    const results = await queryProducts(pick, 20);

    const products: TeaserProduct[] = results
      .filter((p) => p.imageUrl)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        storeName: p.storeName,
        description: p.description?.slice(0, 120) || "",
      }));

    // Shuffle
    for (let i = products.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [products[i], products[j]] = [products[j], products[i]];
    }

    teaserCache = { products, expires: Date.now() + 600000 };
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
