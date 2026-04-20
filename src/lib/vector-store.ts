import { Index } from "@upstash/vector";
import { embedText, embedTexts, cosineSimilarity } from "./gemini";
import { env } from "./env";
import type { NormalizedProduct } from "./shopify-stores";
type ProductMetadata = Record<string, string | number>;
type RangeVector = { id: string | number; metadata?: Record<string, string> };
type RangeResult = { vectors: RangeVector[]; nextCursor: string };

const COLOR_NAMES = new Set([
  "black","white","grey","gray","red","blue","green","navy","olive","cream",
  "beige","tan","brown","pink","purple","orange","yellow","teal","burgundy",
  "charcoal","khaki","coral","mint","sand","ivory","slate","forest","rust",
  "wine","sage","mauve","indigo","emerald","cobalt","crimson","gold","silver",
  "copper","bronze",
]);

let index: Index | null = null;

function getIndex(): Index {
  if (!index) {
    index = new Index({
      url: env.UPSTASH_VECTOR_REST_URL,
      token: env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  return index;
}

function priceBucket(price: number): string {
  if (price < 50) return "budget";
  if (price < 120) return "mid-range";
  if (price < 250) return "premium";
  return "luxury";
}

function productToEmbeddingText(p: NormalizedProduct): string {
  // Include color, category, and price signals for richer semantic matching
  const colorTags = p.tags.filter((t) => COLOR_NAMES.has(t.toLowerCase()));
  const colors = colorTags.length > 0 ? colorTags.join(" ") : "";
  const category = classifyCategory(p);
  return `${p.name} ${p.productType} ${category} ${p.vendor} ${p.storeName} ${priceBucket(p.price)} ${colors} ${p.tags.slice(0, 8).join(" ")} ${p.description.slice(0, 100)}`;
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
export async function syncProducts(
  products: NormalizedProduct[],
  options?: { skipDeleteDetection?: boolean },
): Promise<{ added: number; updated: number; deleted: number; unchanged: number; total: number; failedUpserts: number; failedDeletes: number }> {
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

  const existingHashes = new Map<string, string>();

  if (!options?.skipDeleteDetection) {
    // Scan ALL existing IDs + hashes from the index (full scan)
    // This ensures we detect products that were removed from Shopify stores
    let scanCursor: string | number = 0;

    while (true) {
      const result: RangeResult = await idx.range({
        cursor: scanCursor,
        limit: 500,
        includeMetadata: true,
      });

      for (const item of result.vectors) {
        const m = (item.metadata || {}) as Record<string, string>;
        existingHashes.set(item.id as string, m._hash || "");
      }

      if (!result.nextCursor || result.nextCursor === "0") break;
      scanCursor = result.nextCursor;
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
  const existingIdsNotInCurrent: string[] = [];
  if (!options?.skipDeleteDetection) {
    for (const existingId of existingHashes.keys()) {
      if (!currentProducts.has(existingId)) {
        existingIdsNotInCurrent.push(existingId);
      }
    }
  }

  console.log(`[vector] incremental: ${toUpsert.length} to upsert, ${unchanged} unchanged, ${existingIdsNotInCurrent.length} to delete`);

  // Upsert new/changed products
  let added = 0;
  let updated = 0;
  let failedUpserts = 0;

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
      failedUpserts += batch.length;
    }

    if (i + BATCH < toUpsert.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Delete removed products
  let deleted = 0;
  let failedDeletes = 0;
  if (existingIdsNotInCurrent.length > 0) {
    for (let i = 0; i < existingIdsNotInCurrent.length; i += BATCH) {
      const batch = existingIdsNotInCurrent.slice(i, i + BATCH);
      try {
        await idx.delete(batch);
        deleted += batch.length;
      } catch (err) {
        console.error(`[vector] delete batch failed:`, err);
        failedDeletes += batch.length;
      }
    }
  }

  console.log(`[vector] sync done: +${added} added, ~${updated} updated, -${deleted} deleted, =${unchanged} unchanged${failedUpserts ? `, !${failedUpserts} upsert failures` : ""}${failedDeletes ? `, !${failedDeletes} delete failures` : ""}`);
  return { added, updated, deleted, unchanged, total: currentProducts.size, failedUpserts, failedDeletes };
}

// Category classification for distribution balancing
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  shoes: /shoe|sneaker|boot|runner|trainer|footwear|slide|sandal|clog/i,
  tops: /shirt|tee|top|tank|jersey|polo|hoodie|sweatshirt|pullover|crew|henley/i,
  bottoms: /pant|short|legging|jogger|tight|trouser|skirt|bottom/i,
  layers: /jacket|vest|coat|windbreaker|fleece|zip|layer|outerwear/i,
  accessories: /hat|cap|sock|bag|belt|sunglasses|watch|scarf|glove|headband|beanie|backpack/i,
};

export function classifyCategory(p: { name: string; productType: string; tags: string[] }): string {
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

  // Fetch more than topK so we have room to rebalance.
  // Outfit queries need a wider net since cosine similarity clusters
  // around the dominant category — 5x gives balanced categories room.
  const wantsOutfit = OUTFIT_KEYWORDS.test(queryText);
  const multiplier = wantsOutfit ? 5 : 3;
  const fetchK = Math.min(topK * multiplier, 500);
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

/** Strip diacritics: ç→c, é→e, etc. */
function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Normalize a vendor name to a canonical key for grouping */
function vendorKey(name: string): string {
  let k = stripDiacritics(name).toLowerCase().trim();
  // Strip corporate/regional suffixes (multi-word like "Netherlands BV")
  k = k.replace(/\s+(netherlands\s+bv|europe|usa|uk|us|inc|llc|ltd|co|bv|gmbh|srl|spa)\.?$/i, "");
  // Strip hyphenated product-line suffixes (e.g. "Cotopaxi-Accessory" → "cotopaxi")
  k = k.replace(/-[a-z]+$/i, "");
  // Normalize whitespace
  k = k.replace(/\s+/g, " ");
  return k;
}

/** Pick the best display name from a group of vendor variants */
function bestDisplayName(variants: string[]): string {
  // Prefer the shortest non-all-caps version, or shortest overall
  const titled = variants.filter((v) => v !== v.toUpperCase() && v !== v.toLowerCase());
  if (titled.length > 0) {
    return titled.sort((a, b) => a.length - b.length)[0];
  }
  // If all are uppercase or lowercase, pick shortest and title-case it
  const shortest = variants.sort((a, b) => a.length - b.length)[0];
  return shortest;
}

/**
 * Embedding-based vendor clustering.
 * Maps every raw vendor name → canonical display name.
 * Built in the background, persists in memory.
 */
let _vendorMap: Map<string, string> | null = null; // raw → canonical
let _vendorList: string[] | null = null; // sorted canonical names
let _vendorMapTs = 0;
const VENDOR_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const SIMILARITY_THRESHOLD = 0.82;

/** Scan the index and collect raw vendor names with their product counts */
async function scanRawVendors(): Promise<Map<string, number>> {
  const idx = getIndex();
  const counts = new Map<string, number>();
  let cursor: string | number = 0;

  while (true) {
    const result: RangeResult = await idx.range({
      cursor,
      limit: 500,
      includeMetadata: true,
    });

    for (const item of result.vectors) {
      const m = (item.metadata || {}) as Record<string, string>;
      if (m.vendor) {
        counts.set(m.vendor, (counts.get(m.vendor) || 0) + 1);
      }
    }

    if (!result.nextCursor || result.nextCursor === "0") break;
    cursor = result.nextCursor;
  }

  return counts;
}

/**
 * Build the vendor mapping using embeddings.
 * 1. Collects all raw vendor names from the index
 * 2. Rule-based pre-grouping (fast, catches accents/casing/suffixes)
 * 3. Embeds each group's canonical name
 * 4. Clusters by cosine similarity to merge near-duplicates
 * 5. Caches the raw→canonical mapping in memory
 *
 * Call this from /api/wizard/sync or a dedicated endpoint.
 */
export async function buildVendorMap(): Promise<{ total: number; clusters: number }> {
  invalidateVendorCache();
  const rawCounts = await scanRawVendors();

  // Step 1: Rule-based pre-grouping
  const ruleGroups = new Map<string, { variants: string[]; count: number }>();
  for (const [raw, count] of rawCounts) {
    const key = vendorKey(raw);
    if (!ruleGroups.has(key)) ruleGroups.set(key, { variants: [], count: 0 });
    const g = ruleGroups.get(key)!;
    g.variants.push(raw);
    g.count += count;
  }

  // Pick display name per rule-group
  const preGroups = Array.from(ruleGroups.values()).map((g) => ({
    displayName: bestDisplayName(g.variants),
    variants: g.variants,
    count: g.count,
  }));

  // Step 2: Embed each group's display name
  const names = preGroups.map((g) => g.displayName);
  const embeddings = await embedTexts(names);

  // Step 3: Greedy clustering by cosine similarity
  // Sort by count descending — most products = likely the canonical name
  const indexed = preGroups.map((g, i) => ({ ...g, embedding: embeddings[i], clusterId: -1 }));
  indexed.sort((a, b) => b.count - a.count);

  const clusters: { canonical: string; members: typeof indexed }[] = [];

  for (const item of indexed) {
    let merged = false;
    for (const cluster of clusters) {
      const sim = cosineSimilarity(item.embedding, cluster.members[0].embedding);
      if (sim >= SIMILARITY_THRESHOLD) {
        cluster.members.push(item);
        merged = true;
        break;
      }
    }
    if (!merged) {
      clusters.push({ canonical: item.displayName, members: [item] });
    }
  }

  // Step 4: Prefix-merge — find clusters that share a common prefix and group them
  // e.g. "Comme des Garcons Homme" + "Comme des Garcons Play" → "Comme des Garcons"
  const MIN_PREFIX_LEN = 8; // long enough to avoid false positives

  // Build a map of normalized prefix → cluster indices
  const prefixGroups = new Map<string, number[]>();
  for (let i = 0; i < clusters.length; i++) {
    const key = stripDiacritics(clusters[i].canonical).toLowerCase();
    // Try progressively shorter prefixes (split on space/hyphen)
    const words = key.split(/[\s-]+/);
    for (let w = words.length - 1; w >= 1; w--) {
      const prefix = words.slice(0, w).join(" ");
      if (prefix.length >= MIN_PREFIX_LEN) {
        if (!prefixGroups.has(prefix)) prefixGroups.set(prefix, []);
        prefixGroups.get(prefix)!.push(i);
        break; // only add to the longest matching prefix
      }
    }
  }

  // Merge clusters that share a prefix (2+ clusters with same prefix)
  const absorbed = new Set<number>();
  for (const [prefix, indices] of prefixGroups) {
    if (indices.length < 2) continue;
    // Find the cluster with the most products as the parent, or use the prefix itself
    const parentIdx = indices.sort((a, b) => {
      const countA = clusters[a].members.reduce((s, m) => s + m.count, 0);
      const countB = clusters[b].members.reduce((s, m) => s + m.count, 0);
      return countB - countA;
    })[0];
    // Rename to the shared prefix (title-cased from the canonical that best matches)
    const bestCanonical = clusters[parentIdx].canonical;
    // Use the prefix length to trim the canonical name
    const prefixDisplay = bestCanonical.slice(0, prefix.length);
    clusters[parentIdx].canonical = prefixDisplay;

    for (const idx of indices) {
      if (idx === parentIdx) continue;
      clusters[parentIdx].members.push(...clusters[idx].members);
      absorbed.add(idx);
    }
  }
  const mergedClusters = clusters.filter((_, i) => !absorbed.has(i));

  // Step 5: Build raw → canonical mapping
  const mapping = new Map<string, string>();
  for (const cluster of mergedClusters) {
    for (const member of cluster.members) {
      for (const raw of member.variants) {
        mapping.set(raw, cluster.canonical);
      }
    }
  }

  _vendorMap = mapping;
  _vendorList = mergedClusters.map((c) => c.canonical).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  _vendorMapTs = Date.now();

  console.log(`[vendors] built map: ${rawCounts.size} raw → ${mergedClusters.length} brands`);
  return { total: rawCounts.size, clusters: mergedClusters.length };
}

/** Invalidate the vendor cache so the next read triggers a rebuild */
export function invalidateVendorCache(): void {
  _vendorMapTs = 0;
}

/** Get the raw→canonical vendor mapping, building rule-based fallback if needed */
function getVendorMap(): Map<string, string> | null {
  if (_vendorMap && Date.now() - _vendorMapTs < VENDOR_CACHE_TTL) {
    return _vendorMap;
  }
  return null;
}

/**
 * Get unique vendor/brand names.
 * Uses embedding-based clusters if available, falls back to rule-based.
 */
export async function getUniqueVendors(): Promise<string[]> {
  // Use embedding-based list if available
  if (_vendorList && Date.now() - _vendorMapTs < VENDOR_CACHE_TTL) {
    return _vendorList;
  }

  // Fallback: rule-based scan
  const idx = getIndex();
  const groups = new Map<string, Set<string>>();
  let cursor: string | number = 0;

  while (true) {
    const result: RangeResult = await idx.range({
      cursor,
      limit: 500,
      includeMetadata: true,
    });

    for (const item of result.vectors) {
      const m = (item.metadata || {}) as Record<string, string>;
      if (m.vendor) {
        const key = vendorKey(m.vendor);
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key)!.add(m.vendor);
      }
    }

    if (!result.nextCursor || result.nextCursor === "0") break;
    cursor = result.nextCursor;
  }

  const vendors = Array.from(groups.values())
    .map((variants) => bestDisplayName(Array.from(variants)))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return vendors;
}

/**
 * Get all products for a specific vendor/brand from the index.
 * Uses embedding-based mapping if available, falls back to rule-based key matching.
 */
export async function getProductsByVendor(vendor: string): Promise<NormalizedProduct[]> {
  const idx = getIndex();
  const mapping = getVendorMap();
  const targetKey = vendorKey(vendor);
  const products: NormalizedProduct[] = [];
  let cursor: string | number = 0;

  while (true) {
    const result: RangeResult = await idx.range({
      cursor,
      limit: 500,
      includeMetadata: true,
    });

    for (const item of result.vectors) {
      const m = (item.metadata || {}) as Record<string, string>;
      const rawVendor = m.vendor || "";
      // Check if this product's vendor maps to the same canonical brand
      const matches = mapping
        ? mapping.get(rawVendor) === vendor
        : vendorKey(rawVendor) === targetKey;
      if (matches) {
        products.push({
          name: m.name || "",
          price: parseFloat(m.price) || 0,
          imageUrl: m.imageUrl || "",
          productUrl: m.productUrl || "",
          storeName: m.storeName || "",
          vendor: m.vendor || "",
          description: m.description || "",
          productType: m.productType || "",
          tags: m.tags ? m.tags.split(",") : [],
        });
      }
    }

    if (!result.nextCursor || result.nextCursor === "0") break;
    cursor = result.nextCursor;
  }

  return products;
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

