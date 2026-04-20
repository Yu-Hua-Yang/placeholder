import { NextResponse } from "next/server";
import { env } from "./env";

let _aiLimiter: RateLimiterInstance | null = null;
let _emailLimiter: RateLimiterInstance | null = null;

interface RateLimiterInstance {
  limit: (key: string) => Promise<{ success: boolean; reset: number }>;
}

async function createLimiters() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  _aiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "ratelimit:ai",
  });

  _emailLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "ratelimit:email",
  });

  return { ai: _aiLimiter, email: _emailLimiter };
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function getLimiter(type: "ai" | "email"): Promise<RateLimiterInstance | null> {
  if (type === "ai" && _aiLimiter) return _aiLimiter;
  if (type === "email" && _emailLimiter) return _emailLimiter;
  const limiters = await createLimiters();
  if (!limiters) return null;
  return type === "ai" ? limiters.ai : limiters.email;
}

/**
 * Check rate limit. Returns a 429 Response if exceeded, or null if allowed.
 * Gracefully skips if Redis env vars are not configured.
 */
export async function checkRateLimit(
  req: Request,
  type: "ai" | "email",
): Promise<NextResponse | null> {
  const limiter = await getLimiter(type);
  if (!limiter) return null; // Redis not configured, skip

  const ip = getClientIp(req);
  const { success, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) },
      },
    );
  }

  return null;
}
