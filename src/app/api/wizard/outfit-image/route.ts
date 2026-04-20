export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateOutfitImage } from "@/lib/gemini";
import { getOutfitImagePrompt, type OutfitItemDetail } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/ratelimit";
import type { BiometricResult, OutfitItem } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const rateLimited = await checkRateLimit(req, "ai");
    if (rateLimited) return rateLimited;
    const { fitName, fitVibe, colorPalette, items, biometricResults, biometricImage } = (await req.json()) as {
      fitName: string;
      fitVibe: string;
      colorPalette: string[];
      items: OutfitItem[];
      biometricResults: BiometricResult | null;
      biometricImage: string;
    };

    if (!biometricImage || !fitName || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const itemDetails: OutfitItemDetail[] = items.map((item) => ({
      name: item.name,
      price: item.price,
      slot: item.slot || "ITEM",
      colorDescription: item.colorDescription || "",
      visualDescription: item.visualDescription || item.name,
    }));

    const prompt = getOutfitImagePrompt(fitName, fitVibe, colorPalette || [], itemDetails, biometricResults);
    const imageBase64 = await generateOutfitImage(biometricImage, prompt);

    return NextResponse.json({ imageBase64 });
  } catch (error) {
    console.error("Outfit image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 },
    );
  }
}
