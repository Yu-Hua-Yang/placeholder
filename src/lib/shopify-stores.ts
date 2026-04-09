export interface ShopifyStore {
  domain: string;
  name: string;
  specialty: string[];
}

export const STORES: ShopifyStore[] = [
  // Athletic / Running
  { domain: "www.allbirds.com", name: "Allbirds", specialty: ["running", "shoes", "activewear"] },
  { domain: "www.nobullproject.com", name: "NOBULL", specialty: ["crossfit", "training", "shoes", "apparel"] },
  { domain: "www.outdoorvoices.com", name: "Outdoor Voices", specialty: ["activewear", "running", "apparel"] },
  { domain: "www.satisfyrunning.com", name: "Satisfy", specialty: ["running", "premium", "apparel"] },
  { domain: "www.janji.com", name: "Janji", specialty: ["running", "apparel", "sustainable"] },
  { domain: "www.2xu.com", name: "2XU", specialty: ["compression", "triathlon", "running"] },
  // Gym / Training
  { domain: "www.lskd.co", name: "LSKD", specialty: ["gym", "training", "apparel"] },
  { domain: "www.ryderwear.com", name: "Ryderwear", specialty: ["gym", "bodybuilding", "apparel"] },
  { domain: "www.alphaleteathletics.com", name: "Alphalete", specialty: ["gym", "training", "apparel"] },
  { domain: "www.hylete.com", name: "Hylete", specialty: ["crossfit", "training", "apparel"] },
  // Women's Activewear
  { domain: "www.setactive.co", name: "SET Active", specialty: ["activewear", "women", "gym"] },
  { domain: "www.girlfriend.com", name: "Girlfriend Collective", specialty: ["activewear", "sustainable", "women"] },
  // Outdoor
  { domain: "www.cotopaxi.com", name: "Cotopaxi", specialty: ["outdoor", "hiking", "gear", "jackets"] },
  // Yoga / Wellness
  { domain: "www.yogaoutlet.com", name: "YogaOutlet", specialty: ["yoga", "activewear", "wellness"] },
  { domain: "www.manduka.com", name: "Manduka", specialty: ["yoga", "mats", "accessories"] },
  // Accessories
  { domain: "www.stance.com", name: "Stance", specialty: ["socks", "accessories", "performance"] },
  // Sportswear
  { domain: "wsportswears.com", name: "W Sportswears", specialty: ["sportswear", "apparel", "activewear"] },
  // Sneakers / Streetwear
  { domain: "www.undefeated.com", name: "Undefeated", specialty: ["sneakers", "nike", "jordan", "streetwear"] },
  { domain: "www.deadstock.ca", name: "Deadstock", specialty: ["sneakers", "streetwear", "yeezy", "nike"] },
  { domain: "nrml.ca", name: "NRML", specialty: ["sneakers", "streetwear", "apparel", "nike", "adidas"] },
  { domain: "www.featuresneakerboutique.com", name: "Feature", specialty: ["sneakers", "premium", "streetwear"] },
  // Designer / Luxury
  { domain: "www.rickowens.eu", name: "Rick Owens", specialty: ["luxury", "avant-garde", "sneakers", "apparel"] },
  { domain: "www.maisonmargiela.com", name: "Maison Margiela", specialty: ["luxury", "avant-garde", "sneakers", "apparel", "accessories"] },
  { domain: "www.hlorenzo.com", name: "H.Lorenzo", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "apparel", "sneakers"] },
  { domain: "www.wrongweather.net", name: "Wrong Weather", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "apparel"] },
  { domain: "www.darklandsberlin.com", name: "Darklands Berlin", specialty: ["luxury", "avant-garde", "rick-owens", "apparel"] },
  { domain: "www.antonioli.eu", name: "Antonioli", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "sneakers", "apparel"] },
  { domain: "www.ln-cc.com", name: "LN-CC", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "apparel", "sneakers"] },
  { domain: "www.gravitypope.com", name: "gravitypope", specialty: ["luxury", "sneakers", "rick-owens", "margiela", "footwear"] },
  { domain: "www.eleonorabonucci.com", name: "Eleonora Bonucci", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "apparel"] },
  { domain: "www.patronofthenew.com", name: "Patron of the New", specialty: ["luxury", "avant-garde", "rick-owens", "margiela", "apparel"] },
  { domain: "www.reebok.com", name: "Reebok", specialty: ["training", "running", "shoes", "apparel"] },
  // Streetwear
  { domain: "www.palaceskateboards.com", name: "Palace", specialty: ["streetwear", "skate", "apparel"] },
  { domain: "www.stussy.com", name: "Stussy", specialty: ["streetwear", "apparel", "accessories"] },
  { domain: "us.bape.com", name: "BAPE", specialty: ["streetwear", "luxury", "sneakers", "apparel"] },
  // Multi-brand sneaker retailers
  { domain: "www.shoepalace.com", name: "Shoe Palace", specialty: ["sneakers", "nike", "adidas", "puma", "jordan"] },
  { domain: "www.dtlr.com", name: "DTLR", specialty: ["sneakers", "nike", "adidas", "new-balance", "apparel"] },
  { domain: "www.socialstatuspgh.com", name: "Social Status", specialty: ["sneakers", "nike", "new-balance", "premium"] },
  { domain: "www.apbstore.com", name: "APB Store", specialty: ["sneakers", "nike", "adidas", "streetwear"] },
  { domain: "www.packershoes.com", name: "Packer Shoes", specialty: ["sneakers", "nike", "adidas", "new-balance", "asics"] },
  { domain: "www.wishatl.com", name: "Wish ATL", specialty: ["sneakers", "nike", "adidas", "jordan", "streetwear"] },
  // Performance
  { domain: "www.tenthousand.cc", name: "Ten Thousand", specialty: ["training", "gym", "shorts", "apparel"] },
  // Women's athletic
  { domain: "www.carbon38.com", name: "Carbon38", specialty: ["women", "activewear", "luxury", "nike"] },
  // Designer / High Fashion
  { domain: "fearofgod.com", name: "Fear of God", specialty: ["luxury", "streetwear", "designer", "apparel", "essentials"] },
  { domain: "www.kidsuper.com", name: "KidSuper", specialty: ["streetwear", "art", "designer", "apparel"] },
  { domain: "www.sacai.jp", name: "Sacai", specialty: ["luxury", "avant-garde", "designer", "apparel", "accessories"] },
  { domain: "www.baseblu.com", name: "Baseblu", specialty: ["luxury", "designer", "apparel", "max-mara", "the-row"] },
  // Multi-brand Sneaker Boutiques (EU)
  { domain: "www.nakedcph.com", name: "Naked Copenhagen", specialty: ["sneakers", "streetwear", "nike", "adidas", "new-balance"] },
  { domain: "www.footpatrol.com", name: "Footpatrol", specialty: ["sneakers", "adidas", "nike", "reebok", "streetwear"] },
  { domain: "www.oneblockdown.it", name: "One Block Down", specialty: ["sneakers", "streetwear", "designer", "apparel"] },
  // Premium Footwear
  { domain: "www.greats.com", name: "GREATS", specialty: ["sneakers", "premium", "minimal", "footwear"] },
  // Outdoor / Casual
  { domain: "www.roark.com", name: "Roark", specialty: ["outdoor", "adventure", "apparel", "swim"] },
  { domain: "www.marinelayer.com", name: "Marine Layer", specialty: ["casual", "comfortable", "apparel", "sustainable"] },
  // Premium Basics
  { domain: "www.sunspel.com", name: "Sunspel", specialty: ["luxury", "basics", "premium", "apparel", "minimal"] },
];

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  product_type: string;
  vendor: string;
  variants: { price: string; available: boolean }[];
  images: { src: string }[];
  tags: string[];
}

export interface NormalizedProduct {
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  storeName: string;
  vendor: string;
  description: string;
  productType: string;
  tags: string[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim().slice(0, 200);
}

function normalizeProducts(store: ShopifyStore, products: ShopifyProduct[]): NormalizedProduct[] {
  return products
    .filter((p) => p.variants.some((v) => v.available) && p.images.length > 0)
    .map((p) => ({
      name: p.title,
      price: parseFloat(p.variants[0].price),
      imageUrl: p.images[0].src,
      productUrl: `https://${store.domain}/products/${p.handle}`,
      storeName: store.name,
      vendor: p.vendor || store.name,
      description: stripHtml(p.body_html || ""),
      productType: p.product_type || "",
      tags: p.tags || [],
    }));
}

export async function fetchStoreProducts(
  store: ShopifyStore,
  limit = 30,
): Promise<NormalizedProduct[]> {
  try {
    const res = await fetch(
      `https://${store.domain}/products.json?limit=${limit}`,
      {
        headers: { Accept: "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeProducts(store, data.products || []);
  } catch {
    return [];
  }
}

/** Fetch ALL products from a store by paginating */
export async function fetchAllStoreProducts(store: ShopifyStore): Promise<NormalizedProduct[]> {
  const all: NormalizedProduct[] = [];
  let page = 1;
  const perPage = 250;

  try {
    while (true) {
      const res = await fetch(
        `https://${store.domain}/products.json?limit=${perPage}&page=${page}`,
        {
          headers: { Accept: "application/json" },
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!res.ok) break;
      const data = await res.json();
      const products: ShopifyProduct[] = data.products || [];
      if (products.length === 0) break;

      all.push(...normalizeProducts(store, products));
      if (products.length < perPage) break;
      page++;
    }
  } catch {
    // Return whatever we got so far
  }
  return all;
}

/** Fetch products from ALL stores (250 per store) */
export async function fetchAllProducts(): Promise<NormalizedProduct[]> {
  const results = await Promise.allSettled(
    STORES.map((store) => fetchStoreProducts(store, 250)),
  );

  const allProducts: NormalizedProduct[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allProducts.push(...result.value);
    }
  }
  return allProducts;
}
