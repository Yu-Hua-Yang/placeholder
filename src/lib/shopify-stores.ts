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
  // Sneakers / Streetwear (carry Nike, Adidas, Yeezy, Jordan)
  { domain: "www.undefeated.com", name: "Undefeated", specialty: ["sneakers", "nike", "jordan", "streetwear"] },
  { domain: "www.deadstock.ca", name: "Deadstock", specialty: ["sneakers", "streetwear", "yeezy", "nike"] },
  { domain: "nrml.ca", name: "NRML", specialty: ["sneakers", "streetwear", "apparel", "nike", "adidas"] },
  { domain: "www.featuresneakerboutique.com", name: "Feature", specialty: ["sneakers", "premium", "streetwear"] },
  // Designer / Luxury
  { domain: "www.rickowens.eu", name: "Rick Owens", specialty: ["luxury", "avant-garde", "sneakers", "apparel"] },
  { domain: "www.reebok.com", name: "Reebok", specialty: ["training", "running", "shoes", "apparel"] },
  // Streetwear
  { domain: "www.palaceskateboards.com", name: "Palace", specialty: ["streetwear", "skate", "apparel"] },
  { domain: "www.stussy.com", name: "Stussy", specialty: ["streetwear", "apparel", "accessories"] },
  { domain: "us.bape.com", name: "BAPE", specialty: ["streetwear", "luxury", "sneakers", "apparel"] },
  // Multi-brand sneaker / sportswear retailers (carry Nike, Adidas, NB, Puma, etc.)
  { domain: "www.shoepalace.com", name: "Shoe Palace", specialty: ["sneakers", "nike", "adidas", "puma", "jordan"] },
  { domain: "www.dtlr.com", name: "DTLR", specialty: ["sneakers", "nike", "adidas", "new-balance", "apparel"] },
  { domain: "www.socialstatuspgh.com", name: "Social Status", specialty: ["sneakers", "nike", "new-balance", "premium"] },
  { domain: "www.apbstore.com", name: "APB Store", specialty: ["sneakers", "nike", "adidas", "streetwear"] },
  { domain: "www.packershoes.com", name: "Packer Shoes", specialty: ["sneakers", "nike", "adidas", "new-balance", "asics"] },
  { domain: "www.wishatl.com", name: "Wish ATL", specialty: ["sneakers", "nike", "adidas", "jordan", "streetwear"] },
  // Performance / running specialty
  { domain: "www.tenthousand.cc", name: "Ten Thousand", specialty: ["training", "gym", "shorts", "apparel"] },
  // Women's athletic
  { domain: "www.carbon38.com", name: "Carbon38", specialty: ["women", "activewear", "luxury", "nike"] },
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
    const products: ShopifyProduct[] = data.products || [];

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
  } catch {
    return [];
  }
}

export async function searchAllStores(limit = 30): Promise<NormalizedProduct[]> {
  const results = await Promise.allSettled(
    STORES.map((store) => fetchStoreProducts(store, limit)),
  );

  const allProducts: NormalizedProduct[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allProducts.push(...result.value);
    }
  }
  return allProducts;
}
