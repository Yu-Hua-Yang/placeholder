import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    }

    console.log(`[email] collected: ${email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email collection error:", error);
    // Don't block the user if email save fails
    return NextResponse.json({ ok: true });
  }
}
