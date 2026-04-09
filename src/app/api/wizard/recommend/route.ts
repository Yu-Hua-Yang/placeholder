export const maxDuration = 60;

import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseWizardRecommendationResult } from "@/lib/gemini";
import { detectRecommendationMode, getWizardRankingPromptTenPicks, getWizardRankingPromptTwoFits } from "@/lib/prompts";
import { type NormalizedProduct } from "@/lib/shopify-stores";
import { queryProducts } from "@/lib/vector-store";
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
    const { movementGoal, answers, biometricResults, biometricImage } = (await req.json()) as {
      movementGoal: string;
      answers: WizardAnswer[];
      biometricResults: BiometricResult | null;
      biometricImage: string | null;
    };

    if (!movementGoal) {
      return NextResponse.json({ error: "movementGoal is required" }, { status: 400 });
    }

    const mode = detectRecommendationMode(movementGoal, answers);
    console.log(`[recommend] mode: ${mode}`);

    // Build query from goal + answers — vector search handles everything
    const queryText = [movementGoal, ...answers.map((a) => a.selectedLabel)].join(". ");
    const productsToRank = await queryProducts(queryText, 150);
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
      ? getWizardRankingPromptTenPicks(candidateProducts, movementGoal, answers, biometricResults)
      : getWizardRankingPromptTwoFits(candidateProducts, movementGoal, answers, biometricResults);

    // Call Gemini for ranking
    const text = await chatComplete(systemPrompt, [
      buildUserMessage(
        "Look at this customer's photo and pick the best products from these partner stores. Consider their body, skin tone, hair, and overall aesthetic.",
        biometricImage || undefined,
        biometricImage ? "image/jpeg" : undefined,
      ),
    ]);

    const parsed = parseWizardRecommendationResult(text);
    console.log(`[recommend] parsed mode:`, parsed?.mode ?? "PARSE_FAILED");

    if (!parsed) {
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
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
