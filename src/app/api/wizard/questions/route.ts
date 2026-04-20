export const maxDuration = 60;

import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseWizardQuestions } from "@/lib/gemini";
import { getQuestionGeneratorPrompt } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/ratelimit";
import { sanitizeUserInput, sanitizeGender } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    const rateLimited = await checkRateLimit(req, "ai");
    if (rateLimited) return rateLimited;

    const { movementGoal, gender, image } = await req.json();
    if (!movementGoal || typeof movementGoal !== "string") {
      return NextResponse.json({ error: "movementGoal is required" }, { status: 400 });
    }

    if (image && typeof image === "string") {
      const MAX_BASE64_LENGTH = 10 * 1024 * 1024;
      if (image.length > MAX_BASE64_LENGTH) {
        return NextResponse.json({ error: "Image too large." }, { status: 413 });
      }
    }

    const sanitizedGoal = sanitizeUserInput(movementGoal, 500);
    const sanitizedGender = sanitizeGender(gender);
    const genderContext = sanitizedGender ? ` Customer gender: ${sanitizedGender}.` : "";
    const systemPrompt = getQuestionGeneratorPrompt(sanitizedGoal);
    const messages = [
      buildUserMessage(
        `My movement goal: ${sanitizedGoal}${genderContext}`,
        image || undefined,
        image ? "image/jpeg" : undefined,
      ),
    ];

    let text = await chatComplete(systemPrompt, messages, { maxOutputTokens: 16384 });
    let questions = parseWizardQuestions(text);

    if (!questions || questions.length === 0) {
      console.warn("[questions] parse failed on first attempt, retrying...");
      text = await chatComplete(systemPrompt, messages, { maxOutputTokens: 16384 });
      questions = parseWizardQuestions(text);
    }

    if (!questions || questions.length === 0) {
      console.error("[questions] parse failed after retry. Raw output:", text.slice(0, 500));
      return NextResponse.json({ error: "Failed to parse questions" }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Wizard questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
