import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import type { InteractiveOption, ProductSearchQuery, WizardQuestion, BiometricResult, ExternalProduct } from "./types";
import type { ProductRecommendation, WizardProductRecommendation } from "./prompts";

const MODEL = "gemini-3-flash-preview";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent({
    contents: messages,
  });

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

function safeJsonParse<T>(json: string, label: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    console.warn(`Failed to parse ${label} JSON:`, json.slice(0, 200));
    return null;
  }
}

export function parseResponse(text: string): ParsedResponse {
  let options: InteractiveOption[] | null = null;
  let readyToRecommend: ProductSearchQuery | null = null;
  let recommendations: ProductRecommendation[] | null = null;

  let match: RegExpExecArray | null;

  const optionsRegex = new RegExp(TAG_PATTERNS.options.source, "g");
  while ((match = optionsRegex.exec(text)) !== null) {
    options = safeJsonParse<InteractiveOption[]>(match[1], "options");
  }

  const rtrRegex = new RegExp(TAG_PATTERNS.readyToRecommend.source, "g");
  while ((match = rtrRegex.exec(text)) !== null) {
    readyToRecommend = safeJsonParse<ProductSearchQuery>(match[1], "ready_to_recommend");
  }

  const recRegex = new RegExp(TAG_PATTERNS.recommendations.source, "g");
  while ((match = recRegex.exec(text)) !== null) {
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
