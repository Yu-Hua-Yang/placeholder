import { NextRequest, NextResponse } from "next/server";

const HF_API_BASE =
  "https://datasets-server.huggingface.co/rows?dataset=ktrinh38/fashion-dataset&config=default&split=train";

// In-memory cache: hfIndex -> { url, expiresAt }
const cache = new Map<number, { url: string; expiresAt: number }>();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  const { index } = await params;
  const hfIndex = parseInt(index, 10);

  if (isNaN(hfIndex) || hfIndex < 0) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }

  // Check cache (with 5 min buffer before expiry)
  const cached = cache.get(hfIndex);
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return NextResponse.redirect(cached.url);
  }

  // Fetch fresh signed URL from HuggingFace
  const res = await fetch(`${HF_API_BASE}&offset=${hfIndex}&length=1`);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from HuggingFace" },
      { status: 502 }
    );
  }

  const data = await res.json();
  const row = data.rows?.[0];
  const imageUrl = row?.row?.image?.src;

  if (!imageUrl) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Parse expiry from the signed URL
  try {
    const url = new URL(imageUrl);
    const expires = parseInt(url.searchParams.get("Expires") || "0", 10);
    cache.set(hfIndex, { url: imageUrl, expiresAt: expires * 1000 });
  } catch {
    cache.set(hfIndex, { url: imageUrl, expiresAt: Date.now() + 3600 * 1000 });
  }

  return NextResponse.redirect(imageUrl);
}
