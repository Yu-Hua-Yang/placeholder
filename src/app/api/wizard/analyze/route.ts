export const maxDuration = 30;

import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseBiometricAnalysis } from "@/lib/gemini";
import { getBiometricAnalysisPrompt } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const rateLimited = await checkRateLimit(req, "ai");
    if (rateLimited) return rateLimited;
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "image (base64) is required" }, { status: 400 });
    }

    const MAX_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5MB decoded
    if (image.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ error: "Image too large. Maximum size is ~7.5MB." }, { status: 413 });
    }

    const systemPrompt = getBiometricAnalysisPrompt();
    const messages = [buildUserMessage("Analyze this photo for biometric fitting.", image, "image/jpeg")];

    const text = await chatComplete(systemPrompt, messages);

    if (text.includes("<no_person>")) {
      return NextResponse.json(
        { error: "We couldn't detect a person in that photo. Please try again with a photo of yourself." },
        { status: 422 },
      );
    }

    const results = parseBiometricAnalysis(text);

    if (!results) {
      return NextResponse.json({ error: "Failed to parse biometric analysis" }, { status: 500 });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Wizard analyze error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
