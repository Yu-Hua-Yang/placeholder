import { NextResponse } from "next/server";
import { isIndexReady } from "@/lib/vector-store";

export async function POST() {
  const ready = await isIndexReady();
  return NextResponse.json({ status: ready ? "ready" : "empty", ready });
}

export async function GET() {
  const ready = await isIndexReady();
  return NextResponse.json({ status: ready ? "ready" : "empty", ready });
}
