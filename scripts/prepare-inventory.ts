import * as fs from "fs";
import * as path from "path";

const HF_API_BASE =
  "https://datasets-server.huggingface.co/rows?dataset=ktrinh38/fashion-dataset&config=default&split=train";

const SPORTS_KEYWORDS =
  /sport|athletic|running|training|gym|active|track|jogger|jersey|workout|fitness|compression|sneaker|shoe|casual/i;

const BATCH_SIZE = 100;
const TARGET_COUNT = 1000;
const MAX_OFFSET = 44000;

interface HFRow {
  row_idx: number;
  row: {
    id: number;
    brandName: string;
    ageGroup: string;
    gender: string;
    baseColour: string;
    season: string;
    usage: string;
    displayCategories: string;
    productDisplayName: string;
    image: { src: string; height: number; width: number };
  };
}

interface InventoryProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  sport: string;
  gender: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  hfIndex: number | null;
  features: string[];
  inStock: boolean;
}

const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#272628",
  White: "#FFFFFF",
  Blue: "#2D5DA1",
  Red: "#C23B22",
  Green: "#4A7C59",
  Yellow: "#F5C518",
  Pink: "#E8909C",
  Grey: "#7C7D81",
  Orange: "#E87040",
  Purple: "#6B3FA0",
  Brown: "#845A37",
  Navy: "#1B2A4A",
  "Navy Blue": "#1B2A4A",
  Maroon: "#6B2D3E",
  Beige: "#C8B88A",
  Olive: "#6B7B3A",
  Teal: "#2D7C7C",
  Khaki: "#BDB76B",
  Charcoal: "#4A4A4A",
  Cream: "#F5F0E1",
  Gold: "#D4A338",
  Silver: "#C0C0C0",
  Tan: "#D2B48C",
  Coral: "#FF7F50",
  Lavender: "#B57EDC",
  Turquoise: "#40E0D0",
  Magenta: "#FF00FF",
  Burgundy: "#800020",
  Rust: "#B7410E",
  "Multi": "#888888",
  "Fluorescent Green": "#7FFF00",
  "Sea Green": "#2E8B57",
  "Lime Green": "#32CD32",
  "Steel": "#4682B4",
  "Rose": "#FF007F",
  "Mushroom Brown": "#907B71",
  "Nude": "#E3BC9A",
  "Mauve": "#9B6B8D",
  "Taupe": "#483C32",
  "Peach": "#FFDAB9",
  "Off White": "#FAF0E6",
  "Coffee Brown": "#6F4E37",
};

function inferCategory(displayCategories: string, name: string): { category: string; subcategory: string } {
  const lower = (displayCategories + " " + name).toLowerCase();
  if (/shoe|sneaker|flip.?flop|sandal|boot|slipper|footwear/.test(lower))
    return { category: "footwear", subcategory: lower.includes("sneaker") || lower.includes("shoe") ? "sneakers" : "sandals" };
  if (/short/.test(lower)) return { category: "apparel", subcategory: "shorts" };
  if (/jogger|track.?pant|trouser|pant|tight|legging/.test(lower))
    return { category: "apparel", subcategory: "pants" };
  if (/jacket|hoodie|sweat|zip/.test(lower)) return { category: "apparel", subcategory: "outerwear" };
  if (/jersey|t-shirt|tshirt|top|polo|tank|vest/.test(lower))
    return { category: "apparel", subcategory: "tops" };
  if (/bag|backpack|hat|cap|sock|glove|watch|band|belt|accessor/.test(lower))
    return { category: "accessories", subcategory: "accessories" };
  if (/shirt/.test(lower)) return { category: "apparel", subcategory: "tops" };
  return { category: "apparel", subcategory: "general" };
}

// Spread items that don't match a specific sport keyword across multiple sports
// using a deterministic rotation based on product id
const SPORT_ROTATION = [
  "training", "running", "outdoor", "yoga", "gym", "crossfit",
  "training", "running", "hiking", "cycling",
];

function inferSport(name: string, usage: string, id: number): string {
  const lower = (name + " " + usage).toLowerCase();
  if (/running|run/.test(lower)) return "running";
  if (/football|soccer/.test(lower)) return "football";
  if (/cricket/.test(lower)) return "cricket";
  if (/basketball/.test(lower)) return "basketball";
  if (/tennis/.test(lower)) return "tennis";
  if (/hiking|outdoor|trail/.test(lower)) return "outdoor";
  if (/swim/.test(lower)) return "swimming";
  if (/yoga/.test(lower)) return "yoga";
  if (/gym|workout|fitness/.test(lower)) return "gym";
  if (/cycl|bike/.test(lower)) return "cycling";
  // Rotate unmatched items across sports for balance
  return SPORT_ROTATION[id % SPORT_ROTATION.length];
}

function inferSizes(category: string, subcategory: string): string[] {
  if (category === "footwear") return ["7", "8", "9", "10", "11", "12"];
  if (category === "accessories") return ["One Size"];
  return ["XS", "S", "M", "L", "XL", "XXL"];
}

function inferFeatures(subcategory: string, name: string): string[] {
  const base: string[] = [];
  const lower = name.toLowerCase();
  if (/dry|moisture|wick/.test(lower)) base.push("moisture-wicking");
  if (/stretch|flex/.test(lower)) base.push("four-way stretch");
  if (/light/.test(lower)) base.push("lightweight");
  if (/breathab/.test(lower)) base.push("breathable");

  const defaults: Record<string, string[]> = {
    sneakers: ["cushioned midsole", "breathable mesh", "rubber outsole", "lightweight"],
    sandals: ["contoured footbed", "quick-dry", "lightweight"],
    shorts: ["moisture-wicking", "quick-dry", "elastic waistband", "lightweight"],
    pants: ["tapered fit", "stretch fabric", "moisture-wicking", "zip pockets"],
    outerwear: ["water-resistant", "breathable", "zip closure", "lightweight"],
    tops: ["moisture-wicking", "breathable mesh", "flatlock seams", "lightweight"],
    accessories: ["lightweight", "adjustable", "durable"],
    general: ["comfortable", "durable", "versatile"],
  };

  const subcatDefaults = defaults[subcategory] || defaults.general;
  for (const f of subcatDefaults) {
    if (!base.includes(f)) base.push(f);
    if (base.length >= 5) break;
  }
  return base.slice(0, 5);
}

function normalizeGender(gender: string): string {
  const g = gender.toLowerCase();
  if (g.includes("men") && !g.includes("women")) return "men";
  if (g.includes("women") || g.includes("girl")) return "women";
  return "unisex";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBatch(offset: number, retries = 3): Promise<HFRow[]> {
  const url = `${HF_API_BASE}&offset=${offset}&length=${BATCH_SIZE}`;
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = (attempt + 1) * 3000;
      console.log(`  Rate limited at offset ${offset}, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} at offset ${offset}`);
    const data = await res.json();
    return data.rows || [];
  }
  throw new Error(`Failed after ${retries} retries at offset ${offset}`);
}

// Balance caps — tighter limits to force diversity
const CATEGORY_CAPS: Record<string, number> = {
  footwear: 280,
  apparel: 500,
  accessories: 220,
};

const SUBCATEGORY_CAPS: Record<string, number> = {
  sneakers: 180,
  sandals: 100,
  tops: 180,
  pants: 100,
  shorts: 80,
  outerwear: 120,
  accessories: 220,
  general: 50,
};

const GENDER_CAPS: Record<string, number> = {
  men: 420,
  women: 380,
  unisex: 200,
};

async function main() {
  const outputPath = path.resolve(__dirname, "../src/data/inventory.json");

  // Collect all eligible products first (overcollect), then balance
  const allCandidates: InventoryProduct[] = [];
  const seenIds = new Set<number>();
  let offset = 0;

  console.log(`Fetching products from HuggingFace API (overcollecting for balance)...`);

  // We need to scan broadly — collect up to ~5000 candidates to pick 1000 balanced
  const OVERCOLLECT = 5000;

  while (allCandidates.length < OVERCOLLECT && offset < MAX_OFFSET) {
    try {
      const rows = await fetchBatch(offset);
      if (rows.length === 0) break;

      for (const entry of rows) {
        if (allCandidates.length >= OVERCOLLECT) break;
        const { row, row_idx } = entry;
        if (seenIds.has(row.id)) continue;

        // Filter: sports/athletic items by usage field or keyword match
        const isSports =
          row.usage?.toLowerCase() === "sports" ||
          row.displayCategories?.toLowerCase().includes("sport") ||
          SPORTS_KEYWORDS.test(row.productDisplayName);

        if (!isSports) continue;
        seenIds.add(row.id);

        const { category, subcategory } = inferCategory(row.displayCategories, row.productDisplayName);
        const gender = normalizeGender(row.gender || "Unisex");
        const sport = inferSport(row.productDisplayName, row.usage, row.id);
        const colorName = row.baseColour || "Black";
        const colorHex = COLOR_HEX_MAP[colorName] || "#888888";

        const idSeed = row.id;
        const price = Math.round((15 + ((idSeed * 7 + 3) % 186)) * 100) / 100;
        const rating = Math.round((3.5 + ((idSeed * 13 + 7) % 15) / 15 * 1.5) * 10) / 10;
        const reviewCount = 5 + ((idSeed * 31 + 11) % 496);

        allCandidates.push({
          id: `prod_${row.id}`,
          name: row.productDisplayName,
          description: row.productDisplayName,
          category,
          subcategory,
          sport,
          gender,
          sizes: inferSizes(category, subcategory),
          colors: [{ name: colorName, hex: colorHex }],
          price,
          rating,
          reviewCount,
          imageUrl: `/api/product-image/${row_idx}`,
          hfIndex: row_idx,
          features: inferFeatures(subcategory, row.productDisplayName),
          inStock: idSeed % 8 !== 0,
        });
      }

      if (offset % 500 === 0) {
        console.log(`  offset=${offset}, candidates=${allCandidates.length}`);
      }
      offset += BATCH_SIZE;
      await sleep(200); // throttle to avoid rate limits
    } catch (err) {
      console.error(`Error at offset ${offset}:`, err);
      offset += BATCH_SIZE;
    }
  }

  console.log(`\nTotal candidates: ${allCandidates.length}`);

  // Now balance-select 1000 products respecting caps
  const products: InventoryProduct[] = [];
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};
  const genderCounts: Record<string, number> = {};

  // Shuffle candidates for variety (deterministic shuffle using id)
  allCandidates.sort((a, b) => {
    const ha = parseInt(a.id.replace(/\D/g, "")) * 2654435761;
    const hb = parseInt(b.id.replace(/\D/g, "")) * 2654435761;
    return (ha & 0xffffffff) - (hb & 0xffffffff);
  });

  for (const product of allCandidates) {
    if (products.length >= TARGET_COUNT) break;

    const catCount = categoryCounts[product.category] || 0;
    const subCount = subcategoryCounts[product.subcategory] || 0;
    const genCount = genderCounts[product.gender] || 0;

    const catCap = CATEGORY_CAPS[product.category] || 200;
    const subCap = SUBCATEGORY_CAPS[product.subcategory] || 100;
    const genCap = GENDER_CAPS[product.gender] || 200;

    if (catCount >= catCap || subCount >= subCap || genCount >= genCap) continue;

    products.push(product);
    categoryCounts[product.category] = catCount + 1;
    subcategoryCounts[product.subcategory] = subCount + 1;
    genderCounts[product.gender] = genCount + 1;
  }

  // If we haven't hit 1000 yet, do a second pass ignoring caps
  if (products.length < TARGET_COUNT) {
    const selected = new Set(products.map((p) => p.id));
    for (const product of allCandidates) {
      if (products.length >= TARGET_COUNT) break;
      if (selected.has(product.id)) continue;
      products.push(product);
      selected.add(product.id);
    }
  }

  console.log(`\nSelected ${products.length} balanced products`);
  console.log("Categories:", countBy(products, "category"));
  console.log("Subcategories:", countBy(products, "subcategory"));
  console.log("Genders:", countBy(products, "gender"));
  console.log("Sports:", countBy(products, "sport"));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`\nWritten to ${outputPath}`);
}

function countBy(arr: InventoryProduct[], key: keyof InventoryProduct): Record<string, number> {
  const counts: Record<string, number> = {};
  arr.forEach((item) => {
    const val = item[key] as string;
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

main().catch(console.error);
