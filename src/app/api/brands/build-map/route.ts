import { NextResponse } from "next/server";
import { buildVendorMap } from "@/lib/vector-store";

export const maxDuration = 120;

export async function POST() {
  try {
    const result = await buildVendorMap();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[build-map] error:", err);
    return NextResponse.json({ error: "Failed to build vendor map" }, { status: 500 });
  }
}
