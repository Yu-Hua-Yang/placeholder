export const maxDuration = 300;

import { NextResponse } from "next/server";
import { fetchAllProducts } from "@/lib/shopify-stores";
import { syncProducts, buildVendorMap } from "@/lib/vector-store";
import { isAuthorized } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  if (!isAuthorized(req.headers.get("authorization"), env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[sync] fetching all products from Shopify stores...");
    const products = await fetchAllProducts();
    console.log(`[sync] fetched ${products.length} products, syncing to vector store...`);

    const result = await syncProducts(products);
    console.log(`[sync] done:`, result);

    // Rebuild vendor/brand mapping in background
    console.log("[sync] rebuilding vendor map...");
    const vendorResult = await buildVendorMap();
    console.log(`[sync] vendor map: ${vendorResult.total} raw → ${vendorResult.clusters} brands`);

    return NextResponse.json({ ...result, vendors: vendorResult });
  } catch (error) {
    console.error("[sync] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
