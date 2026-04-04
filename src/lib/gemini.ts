import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import type { InteractiveOption, ProductSearchQuery } from "./types";
import type { ProductRecommendation } from "./prompts";

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
  });

  const result = await model.generateContent({
    contents: messages,
  });

  return result.response.text();
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
    .trim();
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
