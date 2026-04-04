export const maxDuration = 30;

import { NextRequest } from "next/server";
import {
  buildUserMessage,
  streamChat,
  chatComplete,
  parseResponse,
  type GeminiMessage,
} from "@/lib/gemini";
import { getAdvisorSystemPrompt, getRankingSystemPrompt } from "@/lib/prompts";
import { searchProducts } from "@/lib/inventory";
import type { ProductSearchQuery } from "@/lib/types";

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

// Sniff image mime type from base64 prefix
function detectMimeType(
  base64: string,
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

function buildMessages(
  messages: Array<{ role: string; content: string }>,
  customerImage?: string,
): GeminiMessage[] {
  return messages.map((msg, i) => {
    if (i === 0 && msg.role === "user" && customerImage) {
      return buildUserMessage(
        msg.content,
        customerImage,
        detectMimeType(customerImage),
      );
    }
    const role = msg.role === "assistant" ? "model" : "user";
    return { role, parts: [{ text: msg.content }] };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { phase, messages, customerImage } = body;

    if (phase !== "consult" && phase !== "recommend") {
      return jsonError('Invalid phase. Must be "consult" or "recommend".', 400);
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonError("Messages must be a non-empty array.", 400);
    }

    for (const msg of messages) {
      if (
        (msg.role !== "user" && msg.role !== "assistant") ||
        typeof msg.content !== "string" ||
        !msg.content.trim()
      ) {
        return jsonError(
          'Each message must have role ("user"|"assistant") and non-empty content.',
          400,
        );
      }
    }

    const apiMessages = buildMessages(messages, customerImage);

    // --- Consult mode: stream advisor response ---
    if (phase === "consult") {
      const stream = streamChat(getAdvisorSystemPrompt(), apiMessages);
      return sseResponse(stream);
    }

    // --- Recommend mode: extract criteria → search → stream rankings ---
    const extractionResult = await chatComplete(
      getAdvisorSystemPrompt(),
      apiMessages,
    );
    const parsed = parseResponse(extractionResult);

    let searchQuery: ProductSearchQuery = parsed.readyToRecommend ?? {};
    let candidates = searchProducts(searchQuery);

    // Fallback: relax filters if no results
    if (candidates.length === 0 && parsed.readyToRecommend) {
      const relaxed: ProductSearchQuery = {
        categories: parsed.readyToRecommend.categories,
        sports: parsed.readyToRecommend.sports,
        gender: parsed.readyToRecommend.gender,
      };
      candidates = searchProducts(relaxed);
    }

    // Last resort: return broad results
    if (candidates.length === 0) {
      candidates = searchProducts({});
    }

    const stream = streamChat(getRankingSystemPrompt(candidates), apiMessages);
    return sseResponse(stream);
  } catch (error) {
    console.error("Chat API error:", error);
    return jsonError("Internal server error", 500);
  }
}
