import { NextResponse } from "next/server";
import { chatComplete, buildUserMessage, parseWizardRecommendations } from "@/lib/gemini";
import { getWizardRankingPrompt } from "@/lib/prompts";
import { searchAllStores, STORES, type NormalizedProduct } from "@/lib/shopify-stores";
import type { WizardAnswer, BiometricResult, WizardRecommendedProduct, Product } from "@/lib/types";

// Cache fetched products for 10 minutes to avoid hammering stores
let productCache: { products: NormalizedProduct[]; expires: number } | null = null;

async function getCachedProducts(): Promise<NormalizedProduct[]> {
  if (productCache && productCache.expires > Date.now()) {
    return productCache.products;
  }
  const products = await searchAllStores(10);
  productCache = { products, expires: Date.now() + 600000 };
  return products;
}

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

    // Fetch real products from all Shopify partner stores
    const allProducts = await getCachedProducts();

    if (allProducts.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Pre-filter by brand/store if the user mentioned a specific one
    const allText = [movementGoal, ...answers.map((a) => `${a.selectedLabel} ${a.selectedValue}`)].join(" ").toLowerCase();
    const matchedStore = STORES.find((store) => allText.includes(store.name.toLowerCase()));
    const filteredProducts = matchedStore
      ? allProducts.filter((p) => {
          const brand = matchedStore.name.toLowerCase();
          return (
            p.storeName.toLowerCase() === brand ||
            p.vendor.toLowerCase() === brand ||
            p.name.toLowerCase().includes(brand)
          );
        })
      : allProducts;

    // Convert to Product format for the ranking prompt
    const productsToRank = filteredProducts.length > 0 ? filteredProducts : allProducts;
    const candidateProducts = productsToRank.map((p, i) => normalizedToProduct(p, i));

    // Build a lookup map for the original normalized data (images, URLs, store name)
    const lookupMap = new Map<string, NormalizedProduct>();
    candidateProducts.forEach((p, i) => lookupMap.set(p.id, productsToRank[i]));

    // Let Gemini rank them
    const systemPrompt = getWizardRankingPrompt(candidateProducts, movementGoal, answers, biometricResults);
    // Pass the actual customer photo so Gemini can see them and style accordingly
    const text = await chatComplete(systemPrompt, [
      buildUserMessage(
        "Look at this customer's photo and pick the best products from these partner stores. Consider their body, skin tone, hair, and overall aesthetic.",
        biometricImage || undefined,
        biometricImage ? "image/jpeg" : undefined,
      ),
    ]);

    const recommendations = parseWizardRecommendations(text);

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Build final products with real images and URLs
    const products: WizardRecommendedProduct[] = recommendations
      .map((rec) => {
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
      })
      .filter((p): p is WizardRecommendedProduct => p !== null)
      .sort((a, b) => a.rank - b.rank);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Wizard recommend error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
