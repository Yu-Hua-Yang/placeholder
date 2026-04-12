import { NextResponse } from "next/server";
import { queryProducts, classifyCategory } from "@/lib/vector-store";

interface PairsRequest {
  productName: string;
  productType: string;
  tags: string[];
  storeName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PairsRequest;
    const { productName, productType, storeName } = body;

    // Build a query that finds complementary items
    const sourceCategory = classifyCategory({
      name: productName,
      productType,
      tags: body.tags,
    });

    const complementaryCategories = ["shoes", "tops", "bottoms", "layers", "accessories"]
      .filter((c) => c !== sourceCategory)
      .join(", ");

    const query = `outfit to pair with ${productName} ${productType} - looking for ${complementaryCategories}`;

    const results = await queryProducts(query, 50);

    // Filter out same-name products and balance categories
    const sourceNameLower = productName.toLowerCase();
    const categoryBuckets = new Map<string, typeof results>();

    for (const p of results) {
      if (p.name.toLowerCase() === sourceNameLower) continue;

      const cat = classifyCategory(p);
      if (cat === sourceCategory) continue; // skip same category

      if (!categoryBuckets.has(cat)) categoryBuckets.set(cat, []);
      const bucket = categoryBuckets.get(cat)!;
      if (bucket.length < 2) bucket.push(p); // max 2 per category
    }

    // Flatten and take up to 6
    const pairs = Array.from(categoryBuckets.values()).flat().slice(0, 6);

    return NextResponse.json({ pairs, sourceStore: storeName });
  } catch (err) {
    console.error("[pairs] error:", err);
    return NextResponse.json({ pairs: [], error: "Failed to find pairs" }, { status: 500 });
  }
}
