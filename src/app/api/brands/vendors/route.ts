import { NextResponse } from "next/server";
import { getUniqueVendors } from "@/lib/vector-store";

export async function GET() {
  try {
    const vendors = await getUniqueVendors();
    return NextResponse.json({ vendors }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("[vendors] error:", err);
    return NextResponse.json({ vendors: [] }, { status: 500 });
  }
}
