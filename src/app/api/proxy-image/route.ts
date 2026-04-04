import { NextResponse } from "next/server";

const imageCache = new Map<string, { url: string; expires: number }>();

async function searchNikeImage(productName: string): Promise<string | null> {
  const cacheKey = productName.toLowerCase();
  const cached = imageCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.url;

  try {
    // Strip "Nike" prefix and clean up the name for search
    const query = encodeURIComponent(productName.replace(/^nike\s*/i, "").trim());
    const res = await fetch(`https://www.nike.com/w?q=${query}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract product image URLs from the search results page
    const matches = html.match(/https:\/\/static\.nike\.com\/a\/images\/t_web_pw_592_v2\/f_auto\/[^\s"',)]+/g);
    if (matches && matches.length > 0) {
      // Deduplicate and take the first unique one
      const unique = [...new Set(matches)];
      const imageUrl = unique[0];
      imageCache.set(cacheKey, { url: imageUrl, expires: Date.now() + 3600000 });
      return imageUrl;
    }

    // Fallback: any product image on the page
    const fallbackMatches = html.match(/https:\/\/static\.nike\.com\/a\/images\/[^\s"',)]+\.(?:png|jpg|jpeg|webp)/g);
    if (fallbackMatches && fallbackMatches.length > 0) {
      const imageUrl = fallbackMatches[0];
      imageCache.set(cacheKey, { url: imageUrl, expires: Date.now() + 3600000 });
      return imageUrl;
    }

    return null;
  } catch (err) {
    console.error("Nike image search failed:", err);
    return null;
  }
}

async function fetchImage(imageUrl: string): Promise<NextResponse | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "image/*",
      },
      redirect: "follow",
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const url = searchParams.get("url");

  // Strategy 1: Search Nike by product name (most reliable)
  if (name) {
    const nikeUrl = await searchNikeImage(name);
    if (nikeUrl) {
      const response = await fetchImage(nikeUrl);
      if (response) return response;
    }
  }

  // Strategy 2: Try the direct URL if provided
  if (url) {
    const response = await fetchImage(url);
    if (response) return response;
  }

  return NextResponse.json({ error: "Could not resolve image" }, { status: 404 });
}
