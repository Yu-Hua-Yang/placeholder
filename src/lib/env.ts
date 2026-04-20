function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local or Vercel env configuration.`,
    );
  }
  return value;
}

export const env = {
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
  UPSTASH_VECTOR_REST_URL: requireEnv("UPSTASH_VECTOR_REST_URL"),
  UPSTASH_VECTOR_REST_TOKEN: requireEnv("UPSTASH_VECTOR_REST_TOKEN"),
  GOOGLE_SHEET_WEBHOOK_URL: process.env.GOOGLE_SHEET_WEBHOOK_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  CRON_SECRET: process.env.CRON_SECRET,
} as const;
