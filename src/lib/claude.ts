import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { InteractiveOption, ProductSearchQuery } from "./types";
import type { ProductRecommendation } from "./prompts";

const MODEL = "claude-sonnet-4-6-20250725";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

// --- Message building ---

export function buildUserMessage(
  text: string,
  imageBase64?: string,
  imageMimeType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
): MessageParam {
  if (imageBase64 && imageMimeType) {
    return {
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: imageMimeType, data: imageBase64 },
        },
        { type: "text", text },
      ],
    };
  }
  return { role: "user", content: text };
}

// --- Streaming ---

export function streamChat(
  systemPrompt: string,
  messages: MessageParam[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const stream = getClient().messages.stream({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      let fullText = "";

      stream.on("text", (delta) => {
        fullText += delta;
        const chunk = `data: ${JSON.stringify({ type: "text_delta", text: delta })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      });

      stream.on("finalMessage", () => {
        const chunk = `data: ${JSON.stringify({ type: "message_complete", text: fullText })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      });

      stream.on("error", (error) => {
        const chunk = `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        controller.close();
      });
    },
  });
}

// --- Non-streaming ---

export async function chatComplete(
  systemPrompt: string,
  messages: MessageParam[],
): Promise<string> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
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
  // Extract last occurrence of each tag
  let options: InteractiveOption[] | null = null;
  let readyToRecommend: ProductSearchQuery | null = null;
  let recommendations: ProductRecommendation[] | null = null;

  let match: RegExpExecArray | null;

  // Options — take the last match
  const optionsRegex = new RegExp(TAG_PATTERNS.options.source, "g");
  while ((match = optionsRegex.exec(text)) !== null) {
    options = safeJsonParse<InteractiveOption[]>(match[1], "options");
  }

  // Ready to recommend — take the last match
  const rtrRegex = new RegExp(TAG_PATTERNS.readyToRecommend.source, "g");
  while ((match = rtrRegex.exec(text)) !== null) {
    readyToRecommend = safeJsonParse<ProductSearchQuery>(match[1], "ready_to_recommend");
  }

  // Recommendations — take the last match
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
          // Check if we've closed a known tag
          for (const tag of KNOWN_TAGS) {
            if (tagBuffer.endsWith(`</${tag}>`)) {
              inTag = false;
              tagBuffer = "";
              break;
            }
          }
        } else if (char === "<") {
          // Check if this could be the start of a known tag
          tagBuffer = "<";
          inTag = true;
        } else {
          output += char;
        }

        // If we're buffering but it's clearly not a known tag, flush
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
