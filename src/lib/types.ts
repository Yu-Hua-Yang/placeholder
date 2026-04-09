export interface Product {
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
  features: string[];
  inStock: boolean;
}

export type ConversationPhase = "prompt" | "consult" | "recommend";

export interface ConversationState {
  phase: ConversationPhase;
  messages: Message[];
  customerImage: string | null;
  initialPrompt: string;
  isStreaming: boolean;
}

export type MessageType = "text" | "image" | "interactive" | "products" | "loading";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: MessageType;
  options?: InteractiveOption[];
  products?: Product[];
}

export interface InteractiveOption {
  label: string;
  value: string;
  icon?: string;
  selected?: boolean;
}

export interface RecommendedProduct extends Product {
  rank: number;
  rationale: string;
  fitNotes: string;
  styleNotes: string;
}

export interface ProductSearchQuery {
  categories?: string[];
  sports?: string[];
  gender?: string;
  features?: string[];
  colors?: string[];
  priceRange?: { min?: number; max?: number };
  keywords?: string;
}

// --- Wizard types ---

export type WizardStep =
  | "movement-goal"
  | "questions"
  | "biometric-scan"
  | "scan-results"
  | "email-gate"
  | "product-results";

export interface WizardQuestion {
  id: string;
  questionText: string;
  options: { label: string; value: string }[];
}

export interface WizardAnswer {
  questionId: string;
  questionText: string;
  selectedLabel: string;
  selectedValue: string;
}

export interface ColorPaletteEntry {
  name: string;
  hex: string;
  usage: string; // e.g. "base", "accent", "neutral", "pop"
}

export interface BiometricResult {
  bodyType: string;
  posture: string;
  jointAlignment: string;
  muscleDistribution: string;
  mobility: string;
  buildEstimate: string;
  gender: "men" | "women" | "unisex";
  skinTone: string;
  hairColor: string;
  complexion: string;
  styleVibe: string;
  colorSeason: string;
  personalPalette: ColorPaletteEntry[];
}

export interface WizardRecommendedProduct extends RecommendedProduct {
  matchPercentage: number;
  specs?: Record<string, string>;
  source?: "store" | "partner";
  partnerName?: string;
  productUrl?: string;
}

export type ProductFilterMode = "technical" | "aesthetic";

export interface ExternalProduct {
  name: string;
  price: number;
  imageUrl?: string;
  productUrl: string;
  partnerName: string;
  description: string;
  matchPercentage: number;
  rationale: string;
  specs?: Record<string, string>;
}

// --- Recommendation modes ---

export type RecommendationMode = "ten-picks" | "two-fits";

export interface ArchetypeProduct extends WizardRecommendedProduct {
  archetype: string;
}

export interface OutfitItem extends WizardRecommendedProduct {
  slot: string;
  colorDescription: string;
  visualDescription: string;
}

export interface OutfitFit {
  name: string;
  vibe: string;
  colorPalette: string[];
  items: OutfitItem[];
  generatedImageBase64: string | null;
}

export type RecommendationResult =
  | { mode: "ten-picks"; category: string; products: ArchetypeProduct[] }
  | { mode: "two-fits"; fits: OutfitFit[] };
