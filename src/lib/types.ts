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

export type MessageType = "text" | "image" | "interactive" | "products";

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
