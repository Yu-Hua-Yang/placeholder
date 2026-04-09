export const maxDuration = 300;

import { NextResponse } from "next/server";
import { fetchAllProducts } from "@/lib/shopify-stores";
import { syncProducts } from "@/lib/vector-store";

export async function POST() {
  try {
    console.log("[sync] fetching all products from Shopify stores...");
    const products = await fetchAllProducts();
    console.log(`[sync] fetched ${products.length} products, syncing to vector store...`);

    const result = await syncProducts(products);
    console.log(`[sync] done:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[sync] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
