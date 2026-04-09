export const maxDuration = 60;

import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseWizardQuestions } from "@/lib/gemini";
import { getQuestionGeneratorPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { movementGoal, gender } = await req.json();
    if (!movementGoal || typeof movementGoal !== "string") {
      return NextResponse.json({ error: "movementGoal is required" }, { status: 400 });
    }

    const genderContext = gender ? ` Customer gender: ${gender}.` : "";
    const systemPrompt = getQuestionGeneratorPrompt(movementGoal);
    const messages = [
      buildUserMessage(`My movement goal: ${movementGoal}${genderContext}`),
    ];

    const text = await chatComplete(systemPrompt, messages);
    const questions = parseWizardQuestions(text);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "Failed to parse questions" }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Wizard questions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
