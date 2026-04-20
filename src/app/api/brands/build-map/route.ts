import { NextResponse } from "next/server";
import { buildVendorMap } from "@/lib/vector-store";
import { isAuthorized } from "@/lib/auth";
import { env } from "@/lib/env";

export const maxDuration = 120;

export async function POST(req: Request) {
  if (!isAuthorized(req.headers.get("authorization"), env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await buildVendorMap();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[build-map] error:", err);
    return NextResponse.json({ error: "Failed to build vendor map" }, { status: 500 });
  }
}
