import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import type { InteractiveOption, ProductSearchQuery, WizardQuestion, BiometricResult, ExternalProduct, RecommendationResult } from "./types";
import type { ProductRecommendation, WizardProductRecommendation } from "./prompts";
import { env } from "./env";

const MODEL = "gemini-3-flash-preview";
const EMBEDDING_MODEL = "gemini-embedding-001";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

// --- Message building ---

export type GeminiMessage = Content;

export function buildUserMessage(
  text: string,
  imageBase64?: string,
  imageMimeType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
): GeminiMessage {
  const parts: Part[] = [];
  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: { mimeType: imageMimeType, data: imageBase64 },
    });
  }
  parts.push({ text });
  return { role: "user", parts };
}

// --- Streaming ---

export function streamChat(
  systemPrompt: string,
  messages: GeminiMessage[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const model = getClient().getGenerativeModel({
          model: MODEL,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContentStream({
          contents: messages,
        });

        let fullText = "";

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullText += text;
            const data = `data: ${JSON.stringify({ type: "text_delta", text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        const completeData = `data: ${JSON.stringify({ type: "message_complete", text: fullText })}\n\n`;
        controller.enqueue(encoder.encode(completeData));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const data = `data: ${JSON.stringify({ type: "error", error: message })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }
    },
  });
}

// --- Non-streaming ---

export async function chatComplete(
  systemPrompt: string,
  messages: GeminiMessage[],
  options?: { maxOutputTokens?: number },
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: options?.maxOutputTokens ?? 8192,
    },
  });

  const result = await model.generateContent({
    contents: messages,
  });

  const finishReason = result.response.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    console.warn(`[gemini] output truncated (MAX_TOKENS) — consider increasing maxOutputTokens`);
  }

  return result.response.text();
}

// --- Search-grounded (partner products) ---

export async function chatCompleteWithSearch(
  systemPrompt: string,
  messages: GeminiMessage[],
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    tools: [
      // @ts-expect-error - google_search tool not typed in SDK yet
      { google_search: {} },
    ],
    generationConfig: {
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent({
    contents: messages,
  });

  return result.response.text();
}

export function parseExternalProducts(text: string): ExternalProduct[] | null {
  const match = /<external_products>([\s\S]*?)<\/external_products>/.exec(text);
  if (!match) return null;
  return safeJsonParse<ExternalProduct[]>(match[1], "external_products");
}

// --- Response parsing ---

export interface ParsedResponse {
  displayText: string;
  options: InteractiveOption[] | null;
  readyToRecommend: ProductSearchQuery | null;
  recommendations: ProductRecommendation[] | null;
}

const TAG_PATTERNS = {
  options: /<options>([\s\S]*?)<\/options>/g,
  readyToRecommend: /<ready_to_recommend>([\s\S]*?)<\/ready_to_recommend>/g,
  recommendations: /<recommendations>([\s\S]*?)<\/recommendations>/g,
} as const;

// Pre-compiled regexes for parseResponse (avoids re-creation on every call)
const OPTIONS_REGEX = /<options>([\s\S]*?)<\/options>/g;
const RTR_REGEX = /<ready_to_recommend>([\s\S]*?)<\/ready_to_recommend>/g;
const REC_REGEX = /<recommendations>([\s\S]*?)<\/recommendations>/g;

/**
 * Attempt to repair truncated JSON arrays.
 * If the JSON was cut off mid-array, tries to close open braces/brackets
 * and parse the complete items we do have.
 */
function repairTruncatedJson(json: string): string | null {
  let trimmed = json.trim();
  if (!trimmed.startsWith("[")) return null;

  // Walk backwards to find the last complete object (ends with "}")
  const lastCloseBrace = trimmed.lastIndexOf("}");
  if (lastCloseBrace === -1) return null;

  // Truncate after the last complete object and close the array
  trimmed = trimmed.slice(0, lastCloseBrace + 1);

  // Remove any trailing comma
  trimmed = trimmed.replace(/,\s*$/, "");

  // Close the array
  if (!trimmed.endsWith("]")) trimmed += "]";

  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

function safeJsonParse<T>(
  json: string,
  label: string,
  validate?: (data: unknown) => data is T,
): T | null {
  let toParse = json;
  try {
    const parsed = JSON.parse(toParse);
    if (validate && !validate(parsed)) {
      console.warn(`[parse] ${label}: validation failed`, JSON.stringify(parsed).slice(0, 200));
      return null;
    }
    return parsed as T;
  } catch {
    // Attempt truncated JSON repair for arrays
    const repaired = repairTruncatedJson(toParse);
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired);
        console.warn(`[parse] ${label}: repaired truncated JSON (recovered ${Array.isArray(parsed) ? parsed.length : "?"} items)`);
        if (validate && !validate(parsed)) {
          console.warn(`[parse] ${label}: repaired JSON failed validation`);
          return null;
        }
        return parsed as T;
      } catch {
        // repair also failed
      }
    }
    console.warn(`Failed to parse ${label} JSON:`, json.slice(0, 200));
    return null;
  }
}

export function parseResponse(text: string): ParsedResponse {
  let options: InteractiveOption[] | null = null;
  let readyToRecommend: ProductSearchQuery | null = null;
  let recommendations: ProductRecommendation[] | null = null;

  let match: RegExpExecArray | null;

  OPTIONS_REGEX.lastIndex = 0;
  while ((match = OPTIONS_REGEX.exec(text)) !== null) {
    options = safeJsonParse<InteractiveOption[]>(match[1], "options");
  }

  RTR_REGEX.lastIndex = 0;
  while ((match = RTR_REGEX.exec(text)) !== null) {
    readyToRecommend = safeJsonParse<ProductSearchQuery>(match[1], "ready_to_recommend");
  }

  REC_REGEX.lastIndex = 0;
  while ((match = REC_REGEX.exec(text)) !== null) {
    recommendations = safeJsonParse<ProductRecommendation[]>(match[1], "recommendations");
  }

  const displayText = stripTags(text);

  return { displayText, options, readyToRecommend, recommendations };
}

export function stripTags(text: string): string {
  return text
    .replace(/<options>[\s\S]*?<\/options>/g, "")
    .replace(/<ready_to_recommend>[\s\S]*?<\/ready_to_recommend>/g, "")
    .replace(/<recommendations>[\s\S]*?<\/recommendations>/g, "")
    .replace(/<wizard_questions>[\s\S]*?<\/wizard_questions>/g, "")
    .replace(/<biometric_analysis>[\s\S]*?<\/biometric_analysis>/g, "")
    .replace(/<wizard_recommendations>[\s\S]*?<\/wizard_recommendations>/g, "")
    .replace(/<external_products>[\s\S]*?<\/external_products>/g, "")
    .trim();
}

// --- Wizard parsers ---

export function parseWizardQuestions(text: string): WizardQuestion[] | null {
  const match = /<wizard_questions>([\s\S]*?)<\/wizard_questions>/.exec(text);
  if (!match) return null;
  const parsed = safeJsonParse<Array<{ questionText: string; options: { label: string; value: string }[] }>>(
    match[1],
    "wizard_questions",
  );
  if (!parsed) return null;
  return parsed.map((q, i) => ({
    id: `q-${i}`,
    questionText: q.questionText,
    options: q.options,
  }));
}

export function parseBiometricAnalysis(text: string): BiometricResult | null {
  const match = /<biometric_analysis>([\s\S]*?)<\/biometric_analysis>/.exec(text);
  if (!match) return null;
  return safeJsonParse<BiometricResult>(match[1], "biometric_analysis");
}

export function parseWizardRecommendations(text: string): WizardProductRecommendation[] | null {
  const match = /<wizard_recommendations>([\s\S]*?)<\/wizard_recommendations>/.exec(text);
  if (!match) return null;
  return safeJsonParse<WizardProductRecommendation[]>(match[1], "wizard_recommendations");
}

// Raw shapes from Gemini before hydration
interface RawTenPicks {
  mode: "ten-picks";
  category: string;
  products: (WizardProductRecommendation & { archetype: string })[];
}

interface RawTwoFitsItem extends WizardProductRecommendation {
  slot: string;
  colorDescription: string;
  visualDescription: string;
}

interface RawTwoFits {
  mode: "two-fits";
  fits: { name: string; vibe: string; colorPalette: string[]; items: RawTwoFitsItem[] }[];
}

export function parseWizardRecommendationResult(text: string): RawTenPicks | RawTwoFits | null {
  const match = /<wizard_recommendations>([\s\S]*?)<\/wizard_recommendations>/.exec(text);
  if (!match) return null;
  const parsed = safeJsonParse<RawTenPicks | RawTwoFits>(match[1], "wizard_recommendations");
  if (!parsed || !parsed.mode) return null;
  return parsed;
}

// --- Outfit image generation ---

const IMAGE_MODEL = "nano-banana-pro-preview";

export async function generateOutfitImage(
  biometricImageBase64: string,
  outfitPrompt: string,
): Promise<string | null> {
  try {
    const model = getClient().getGenerativeModel({
      model: IMAGE_MODEL,
      generationConfig: {
        // @ts-expect-error - responseModalities not typed in SDK yet
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: biometricImageBase64 } },
            { text: outfitPrompt },
          ],
        },
      ],
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        return part.inlineData.data as string;
      }
    }

    return null;
  } catch (error) {
    console.error("Outfit image generation failed:", error);
    return null;
  }
}

// --- Embeddings ---

// Gemini batchEmbedContents supports up to 100 texts per call.
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

const EMBED_DIMENSIONS = 1536;

async function batchEmbedWithRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  texts: string[],
): Promise<number[][]> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.batchEmbedContents({
        requests: texts.map((text) => ({
          content: { role: "user", parts: [{ text }] },
          outputDimensionality: EMBED_DIMENSIONS,
        })),
      });
      return result.embeddings.map((emb) => emb.values);
    } catch (err) {
      const is429 = err instanceof Error && err.message.includes("429");
      if (is429 && attempt < MAX_RETRIES - 1) {
        const wait = Math.pow(2, attempt + 1) * 10_000; // 20s, 40s
        console.log(`[embed] rate limited, waiting ${wait / 1000}s before retry ${attempt + 2}/${MAX_RETRIES}`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  return []; // unreachable
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = getClient().getGenerativeModel({ model: EMBEDDING_MODEL });
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await batchEmbedWithRetry(model, batch);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

export async function embedText(text: string): Promise<number[]> {
  const model = getClient().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: EMBED_DIMENSIONS,
  } as Parameters<typeof model.embedContent>[0]);
  return result.embedding.values;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Streaming parser ---

const KNOWN_TAGS = ["options", "ready_to_recommend", "recommendations"];

export function createStreamingParser() {
  let buffer = "";
  let tagBuffer = "";
  let inTag = false;

  return {
    push(delta: string): string {
      let output = "";

      for (const char of delta) {
        if (inTag) {
          tagBuffer += char;
          for (const tag of KNOWN_TAGS) {
            if (tagBuffer.endsWith(`</${tag}>`)) {
              inTag = false;
              tagBuffer = "";
              break;
            }
          }
        } else if (char === "<") {
          tagBuffer = "<";
          inTag = true;
        } else {
          output += char;
        }

        if (inTag && tagBuffer.length > 2) {
          const couldMatch = KNOWN_TAGS.some((tag) =>
            `<${tag}>`.startsWith(tagBuffer) || `</${tag}>`.startsWith(tagBuffer),
          );
          if (!couldMatch) {
            output += tagBuffer;
            tagBuffer = "";
            inTag = false;
          }
        }
      }

      buffer += delta;
      return output;
    },

    getResult(): ParsedResponse {
      return parseResponse(buffer);
    },
  };
}
