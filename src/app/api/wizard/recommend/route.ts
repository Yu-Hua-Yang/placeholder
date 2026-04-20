export const maxDuration = 60;

import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseWizardRecommendationResult } from "@/lib/gemini";
import { detectRecommendationMode, getWizardRankingPromptTenPicks, getWizardRankingPromptTwoFits } from "@/lib/prompts";
import { type NormalizedProduct } from "@/lib/shopify-stores";
import { queryProducts } from "@/lib/vector-store";
import { checkRateLimit } from "@/lib/ratelimit";
import { sanitizeUserInput } from "@/lib/sanitize";
import type { WizardAnswer, BiometricResult, WizardRecommendedProduct, Product, RecommendationResult, ArchetypeProduct, OutfitItem } from "@/lib/types";

function normalizedToProduct(p: NormalizedProduct, index: number): Product {
  return {
    id: `shopify-${index}-${p.storeName.toLowerCase().replace(/\s/g, "")}`,
    name: p.name,
    description: p.description,
    category: p.productType || "general",
    subcategory: p.vendor || p.storeName,
    sport: "",
    gender: "unisex",
    sizes: [],
    colors: [],
    price: p.price,
    rating: 0,
    reviewCount: 0,
    imageUrl: p.imageUrl,
    features: p.tags.slice(0, 5),
    inStock: true,
  };
}

function hydrateProduct(
  rec: { productId: string; rank: number; matchPercentage: number; rationale: string; fitNotes: string; styleNotes: string; specs?: Record<string, string> },
  candidateProducts: Product[],
  lookupMap: Map<string, NormalizedProduct>,
): WizardRecommendedProduct | null {
  const baseProduct = candidateProducts.find((p) => p.id === rec.productId);
  const normalized = lookupMap.get(rec.productId);
  if (!baseProduct || !normalized) return null;

  return {
    ...baseProduct,
    imageUrl: normalized.imageUrl,
    ...rec,
    source: "partner" as const,
    partnerName: normalized.storeName,
    productUrl: normalized.productUrl,
  } as WizardRecommendedProduct;
}

export async function POST(req: Request) {
  try {
    const rateLimited = await checkRateLimit(req, "ai");
    if (rateLimited) return rateLimited;

    const { movementGoal, answers, biometricResults, biometricImage } = (await req.json()) as {
      movementGoal: string;
      answers: WizardAnswer[];
      biometricResults: BiometricResult | null;
      biometricImage: string | null;
    };

    if (!movementGoal) {
      return NextResponse.json({ error: "movementGoal is required" }, { status: 400 });
    }

    if (biometricImage && typeof biometricImage === "string") {
      const MAX_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5MB decoded
      if (biometricImage.length > MAX_BASE64_LENGTH) {
        return NextResponse.json({ error: "Image too large. Maximum size is ~7.5MB." }, { status: 413 });
      }
    }

    const sanitizedGoal = sanitizeUserInput(movementGoal, 500);
    const sanitizedAnswers = answers.map((a) => ({
      ...a,
      selectedLabel: sanitizeUserInput(a.selectedLabel, 200),
    }));

    const mode = detectRecommendationMode(sanitizedGoal, sanitizedAnswers);
    console.log(`[recommend] mode: ${mode}`);

    // Build query from goal + answers + biometric signals for better vector matching
    const queryParts = [sanitizedGoal, ...sanitizedAnswers.map((a) => a.selectedLabel)];
    if (biometricResults) {
      if (biometricResults.gender) queryParts.push(`${biometricResults.gender}'s`);
      if (biometricResults.colorSeason) queryParts.push(biometricResults.colorSeason);
      if (biometricResults.styleVibe) queryParts.push(biometricResults.styleVibe);
    }
    const queryText = queryParts.join(". ");
    // two-fits needs more candidates for category coverage across 5 slots;
    // ten-picks is single-category so fewer candidates suffice
    const topK = mode === "two-fits" ? 100 : 60;
    const productsToRank = await queryProducts(queryText, topK);
    console.log(`[recommend] vector search: ${productsToRank.length} products`);

    if (productsToRank.length === 0) {
      const emptyResult: RecommendationResult = mode === "ten-picks"
        ? { mode: "ten-picks", category: "", products: [] }
        : { mode: "two-fits", fits: [] };
      return NextResponse.json(emptyResult);
    }

    const candidateProducts = productsToRank.map((p, i) => normalizedToProduct(p, i));
    const lookupMap = new Map<string, NormalizedProduct>();
    candidateProducts.forEach((p, i) => lookupMap.set(p.id, productsToRank[i]));

    // Build mode-specific prompt
    const systemPrompt = mode === "ten-picks"
      ? getWizardRankingPromptTenPicks(candidateProducts, sanitizedGoal, sanitizedAnswers, biometricResults)
      : getWizardRankingPromptTwoFits(candidateProducts, sanitizedGoal, sanitizedAnswers, biometricResults);

    // Call Gemini for ranking (with one retry on parse failure)
    const userMessage = buildUserMessage(
      "Look at this customer's photo and pick the best products from these partner stores. Consider their body, skin tone, hair, and overall aesthetic.",
      biometricImage || undefined,
      biometricImage ? "image/jpeg" : undefined,
    );

    let text = await chatComplete(systemPrompt, [userMessage]);
    let parsed = parseWizardRecommendationResult(text);

    if (!parsed) {
      console.warn(`[recommend] parse failed on first attempt, retrying...`);
      text = await chatComplete(systemPrompt, [userMessage]);
      parsed = parseWizardRecommendationResult(text);
    }

    console.log(`[recommend] parsed mode:`, parsed?.mode ?? "PARSE_FAILED");

    if (!parsed) {
      console.error(`[recommend] parse failed after retry. Raw output:`, text.slice(0, 500));
      const emptyResult: RecommendationResult = mode === "ten-picks"
        ? { mode: "ten-picks", category: "", products: [] }
        : { mode: "two-fits", fits: [] };
      return NextResponse.json(emptyResult);
    }

    // Build final result based on mode
    if (parsed.mode === "ten-picks") {
      const products: ArchetypeProduct[] = parsed.products
        .map((rec) => {
          const hydrated = hydrateProduct(rec, candidateProducts, lookupMap);
          if (!hydrated) return null;
          return { ...hydrated, archetype: rec.archetype } as ArchetypeProduct;
        })
        .filter((p): p is ArchetypeProduct => p !== null)
        .sort((a, b) => a.rank - b.rank);

      const result: RecommendationResult = {
        mode: "ten-picks",
        category: parsed.category,
        products,
      };
      return NextResponse.json(result);
    }

    // two-fits mode
    const fits = parsed.fits.map((fit) => ({
      name: fit.name,
      vibe: fit.vibe,
      colorPalette: fit.colorPalette || [],
      items: fit.items
        .map((rec) => {
          const hydrated = hydrateProduct(rec, candidateProducts, lookupMap);
          if (!hydrated) return null;
          return {
            ...hydrated,
            slot: rec.slot || "",
            colorDescription: rec.colorDescription || "",
            visualDescription: rec.visualDescription || "",
          } as OutfitItem;
        })
        .filter((p): p is OutfitItem => p !== null)
        .sort((a, b) => a.rank - b.rank),
      generatedImageBase64: null,
    }));

    const result: RecommendationResult = { mode: "two-fits", fits };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Wizard recommend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
