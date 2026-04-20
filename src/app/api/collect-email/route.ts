import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const rateLimited = await checkRateLimit(req, "email");
    if (rateLimited) return rateLimited;

    const { email } = (await req.json()) as { email: string };
    if (!email || typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const webhookUrl = env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!webhookRes.ok) {
        console.error(`[email] webhook failed: ${webhookRes.status} ${await webhookRes.text().catch(() => "")}`);
        return NextResponse.json({ error: "Failed to save email" }, { status: 502 });
      }
    }

    console.log(`[email] collected: ${email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email collection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
