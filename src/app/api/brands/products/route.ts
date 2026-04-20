import { NextResponse } from "next/server";
import { getProductsByVendor } from "@/lib/vector-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendor = searchParams.get("vendor");

  if (!vendor || vendor.length > 200) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  try {
    const products = await getProductsByVendor(vendor);
    return NextResponse.json({ products }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("[brand-products] error:", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
