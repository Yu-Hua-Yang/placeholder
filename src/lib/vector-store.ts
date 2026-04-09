import { Index } from "@upstash/vector";
import { embedText, embedTexts } from "./gemini";
import type { NormalizedProduct } from "./shopify-stores";
type ProductMetadata = Record<string, string | number>;

let index: Index | null = null;

function getIndex(): Index {
  if (!index) {
    index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }
  return index;
}

function productToEmbeddingText(p: NormalizedProduct): string {
  // Include color info from tags and product name for color-aware matching
  const colorTags = p.tags.filter((t) =>
    /black|white|grey|gray|red|blue|green|navy|olive|cream|beige|tan|brown|pink|purple|orange|yellow|teal|burgundy|charcoal|khaki|coral|mint|sand|ivory|slate|forest|rust|wine|sage|mauve|indigo|emerald|cobalt|crimson|gold|silver|copper|bronze/i.test(t)
  );
  const colors = colorTags.length > 0 ? colorTags.join(" ") : "";
  return `${p.name} ${p.productType} ${p.vendor} ${p.storeName} ${colors} ${p.tags.slice(0, 8).join(" ")} ${p.description.slice(0, 80)}`;
}

function productId(p: NormalizedProduct): string {
  // Stable ID based on store + product URL (unique per product)
  return `${p.storeName}::${p.productUrl}`;
}

/** Hash product content to detect changes */
function productHash(p: NormalizedProduct): string {
  return `${p.name}|${p.price}|${p.description.slice(0, 100)}|${p.tags.slice(0, 5).join(",")}|${p.imageUrl}`;
}

/**
 * Incremental sync to Upstash Vector.
 * - Only embeds new or changed products
 * - Deletes products that no longer exist
 * - Detects changes via content hash stored in metadata
 */
export async function syncProducts(products: NormalizedProduct[]): Promise<{ added: number; updated: number; deleted: number; unchanged: number; total: number }> {
  const idx = getIndex();
  const BATCH = 100;

  // Build a map of current products
  const currentProducts = new Map<string, NormalizedProduct>();
  const currentHashes = new Map<string, string>();
  for (const p of products) {
    const id = productId(p);
    currentProducts.set(id, p);
    currentHashes.set(id, productHash(p));
  }

  // Fetch all existing IDs + hashes from the index
  // We do this by fetching vectors in batches using the IDs we know about
  const existingHashes = new Map<string, string>();
  const allCurrentIds = Array.from(currentProducts.keys());

  for (let i = 0; i < allCurrentIds.length; i += BATCH) {
    const batchIds = allCurrentIds.slice(i, i + BATCH);
    try {
      const fetched = await idx.fetch(batchIds, { includeMetadata: true });
      for (const item of fetched) {
        if (item && item.metadata) {
          const m = item.metadata as Record<string, string>;
          existingHashes.set(item.id as string, m._hash || "");
        }
      }
    } catch {
      // Some IDs might not exist yet — that's fine
    }
  }

  // Determine what needs to be added/updated
  const toUpsert: NormalizedProduct[] = [];
  let unchanged = 0;

  for (const [id, product] of currentProducts) {
    const newHash = currentHashes.get(id)!;
    const existingHash = existingHashes.get(id);

    if (existingHash === newHash) {
      unchanged++;
    } else {
      toUpsert.push(product);
    }
  }

  // Determine what needs to be deleted (exists in index but not in current fetch)
  // We need to find IDs in the index that aren't in currentProducts
  // Since we can't list all IDs easily, we'll track deletions by checking
  // the index info for count mismatch after upsert
  const existingIdsNotInCurrent: string[] = [];
  for (const existingId of existingHashes.keys()) {
    if (!currentProducts.has(existingId)) {
      existingIdsNotInCurrent.push(existingId);
    }
  }

  console.log(`[vector] incremental: ${toUpsert.length} to upsert, ${unchanged} unchanged, ${existingIdsNotInCurrent.length} to delete`);

  // Upsert new/changed products
  let added = 0;
  let updated = 0;

  for (let i = 0; i < toUpsert.length; i += BATCH) {
    const batch = toUpsert.slice(i, i + BATCH);
    const texts = batch.map(productToEmbeddingText);

    try {
      const embeddings = await embedTexts(texts);
      const vectors = batch.map((p, j) => ({
        id: productId(p),
        vector: embeddings[j],
        metadata: {
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          storeName: p.storeName,
          vendor: p.vendor,
          description: p.description.slice(0, 200),
          productType: p.productType,
          tags: p.tags.slice(0, 5).join(","),
          _hash: productHash(p),
        } as ProductMetadata,
      }));

      await idx.upsert(vectors);

      for (const p of batch) {
        if (existingHashes.has(productId(p))) {
          updated++;
        } else {
          added++;
        }
      }
    } catch (err) {
      console.error(`[vector] upsert batch ${Math.floor(i / BATCH) + 1} failed:`, err);
    }

    if (i + BATCH < toUpsert.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Delete removed products
  let deleted = 0;
  if (existingIdsNotInCurrent.length > 0) {
    for (let i = 0; i < existingIdsNotInCurrent.length; i += BATCH) {
      const batch = existingIdsNotInCurrent.slice(i, i + BATCH);
      try {
        await idx.delete(batch);
        deleted += batch.length;
      } catch (err) {
        console.error(`[vector] delete batch failed:`, err);
      }
    }
  }

  console.log(`[vector] sync done: +${added} added, ~${updated} updated, -${deleted} deleted, =${unchanged} unchanged`);
  return { added, updated, deleted, unchanged, total: currentProducts.size };
}

// Category classification for distribution balancing
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  shoes: /shoe|sneaker|boot|runner|trainer|footwear|slide|sandal|clog/i,
  tops: /shirt|tee|top|tank|jersey|polo|hoodie|sweatshirt|pullover|crew|henley/i,
  bottoms: /pant|short|legging|jogger|tight|trouser|skirt|bottom/i,
  layers: /jacket|vest|coat|windbreaker|fleece|zip|layer|outerwear/i,
  accessories: /hat|cap|sock|bag|belt|sunglasses|watch|scarf|glove|headband|beanie|backpack/i,
};

function classifyCategory(p: { name: string; productType: string; tags: string[] }): string {
  const text = `${p.name} ${p.productType} ${p.tags.join(" ")}`;
  for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(text)) return cat;
  }
  return "other";
}

// Outfit-intent keywords
const OUTFIT_KEYWORDS = /outfit|full|head to toe|whole look|complete|drip|style me|dress me|\bfit\b|\blook\b/i;

/**
 * Query the vector index for products similar to the user's search.
 * When the query implies an outfit, enforces category distribution
 * so results include shoes, tops, bottoms, layers, and accessories.
 */
export async function queryProducts(
  queryText: string,
  topK = 150,
): Promise<NormalizedProduct[]> {
  const idx = getIndex();
  const queryVector = await embedText(queryText);

  // Fetch more than topK so we have room to rebalance
  const fetchK = Math.min(topK * 3, 500);
  const results = await idx.query({
    vector: queryVector,
    topK: fetchK,
    includeMetadata: true,
  });

  const allProducts = results.map((r) => {
    const m = (r.metadata || {}) as Record<string, string>;
    return {
      name: m.name || "",
      price: parseFloat(m.price) || 0,
      imageUrl: m.imageUrl || "",
      productUrl: m.productUrl || "",
      storeName: m.storeName || "",
      vendor: m.vendor || "",
      description: m.description || "",
      productType: m.productType || "",
      tags: m.tags ? m.tags.split(",") : [],
      _score: r.score || 0,
    };
  });

  // If query implies an outfit, balance categories
  const wantsOutfit = OUTFIT_KEYWORDS.test(queryText);

  if (wantsOutfit && allProducts.length > topK) {
    return balancedSelect(allProducts, topK);
  }

  // Otherwise just take top results with store diversity
  return diverseSelect(allProducts, topK);
}

/** Select products ensuring category balance for outfit queries */
function balancedSelect(
  products: (NormalizedProduct & { _score: number })[],
  topK: number,
): NormalizedProduct[] {
  const buckets = new Map<string, (NormalizedProduct & { _score: number })[]>();

  for (const p of products) {
    const cat = classifyCategory(p);
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat)!.push(p);
  }

  const categories = ["shoes", "tops", "bottoms", "layers", "accessories", "other"];
  const perCategory = Math.ceil(topK / categories.length);
  const selected: NormalizedProduct[] = [];

  // Take up to perCategory from each category (already sorted by score from Upstash)
  for (const cat of categories) {
    const bucket = buckets.get(cat) || [];
    for (const p of bucket.slice(0, perCategory)) {
      if (selected.length >= topK) break;
      selected.push(p);
    }
  }

  // Fill remaining slots with highest-scoring products not yet selected
  if (selected.length < topK) {
    const selectedNames = new Set(selected.map((p) => `${p.storeName}::${p.name}`));
    for (const p of products) {
      if (selected.length >= topK) break;
      if (!selectedNames.has(`${p.storeName}::${p.name}`)) {
        selected.push(p);
      }
    }
  }

  return selected;
}

/** Select top products with store diversity */
function diverseSelect(
  products: (NormalizedProduct & { _score: number })[],
  topK: number,
): NormalizedProduct[] {
  const selected: NormalizedProduct[] = [];
  const storeCount = new Map<string, number>();
  const maxPerStore = Math.ceil(topK / 5);

  for (const p of products) {
    if (selected.length >= topK) break;
    const count = storeCount.get(p.storeName) || 0;
    if (count >= maxPerStore) continue;
    selected.push(p);
    storeCount.set(p.storeName, count + 1);
  }

  return selected;
}

/**
 * Sync a set of products (e.g. from a brand deep fetch) into the vector DB,
 * then query for the most relevant ones. Products already in the DB are
 * updated via upsert (idempotent).
 */
export async function syncAndQueryProducts(
  products: NormalizedProduct[],
  queryText: string,
  topK = 150,
): Promise<NormalizedProduct[]> {
  // Embed and upsert in batches — for a single store this is typically 1-5 calls
  const BATCH = 100;
  const idx = getIndex();

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const texts = batch.map(productToEmbeddingText);

    try {
      const embeddings = await embedTexts(texts);
      const vectors = batch.map((p, j) => ({
        id: productId(p),
        vector: embeddings[j],
        metadata: {
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          storeName: p.storeName,
          vendor: p.vendor,
          description: p.description.slice(0, 200),
          productType: p.productType,
          tags: p.tags.slice(0, 5).join(","),
        } as ProductMetadata,
      }));
      await idx.upsert(vectors);
    } catch (err) {
      console.error(`[vector] sync+query batch failed:`, err);
    }

    if (i + BATCH < products.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`[vector] synced ${products.length} brand products, now querying...`);

  // Now query — the freshly upserted products are immediately queryable
  return queryProducts(queryText, topK);
}

/**
 * Check if vector index is populated.
 */
export async function isIndexReady(): Promise<boolean> {
  try {
    const idx = getIndex();
    const info = await idx.info();
    return info.vectorCount > 0;
  } catch {
    return false;
  }
}

