"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Message, ConversationPhase, InteractiveOption, Product, RecommendedProduct } from "@/lib/types";
import { stripTags, parseResponse, type ParsedResponse } from "@/lib/gemini";
import type { ProductRecommendation } from "@/lib/prompts";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  customerImage: string;
  initialPrompt: string;
  onStartOver: () => void;
}

export default function ChatWindow({
  customerImage,
  initialPrompt,
  onStartOver,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>("consult");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecommendedProducts = async (
    recommendations: ProductRecommendation[],
  ): Promise<RecommendedProduct[]> => {
    try {
      const ids = recommendations.map((r) => r.productId);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) return [];
      const products: Product[] = await res.json();

      return recommendations
        .map((rec) => {
          const product = products.find((p) => p.id === rec.productId);
          if (!product) return null;
          return { ...product, ...rec } as RecommendedProduct;
        })
        .filter((p): p is RecommendedProduct => p !== null)
        .sort((a, b) => a.rank - b.rank);
    } catch {
      return [];
    }
  };

  const sendRecommend = useCallback(
    async (currentMessages: Message[]) => {
      const loadingMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Finding your perfect gear...",
        type: "text",
      };

      setMessages([...currentMessages, loadingMsg]);
      setIsStreaming(true);

      const apiMessages = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phase: "recommend",
            messages: apiMessages,
            customerImage:
              currentMessages.filter((m) => m.role === "user").length === 1
                ? customerImage
                : undefined,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";
        let parsed: ParsedResponse | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "text_delta") {
                fullText += event.text;
                const stripped = stripTags(fullText);
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    content: stripped || "Finding your perfect gear...",
                  };
                  return copy;
                });
              } else if (event.type === "message_complete") {
                parsed = parseResponse(event.text);
              }
            } catch {
              // skip
            }
          }
        }

        if (parsed) {
          let products: RecommendedProduct[] | undefined;
          if (parsed.recommendations && parsed.recommendations.length > 0) {
            products = await fetchRecommendedProducts(parsed.recommendations);
          }

          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              content: parsed!.displayText,
              products: products ?? undefined,
              type: products ? "products" : "text",
            };
            return copy;
          });
        }
      } catch (error) {
        console.error("Recommend error:", error);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: "Sorry, something went wrong finding recommendations.",
          };
          return copy;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [customerImage],
  );

  const sendMessage = useCallback(
    async (
      userContent: string,
      currentMessages: Message[],
      currentPhase: ConversationPhase,
    ) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userContent,
        type: "text",
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        type: "text",
      };

      const updatedMessages = [...currentMessages, userMsg];
      setMessages([...updatedMessages, assistantMsg]);
      setIsStreaming(true);

      // Build API messages (plain role+content for the API)
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phase: currentPhase,
            messages: apiMessages,
            customerImage:
              updatedMessages.filter((m) => m.role === "user").length === 1
                ? customerImage
                : undefined,
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";
        let parsed: ParsedResponse | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "text_delta") {
                fullText += event.text;
                const stripped = stripTags(fullText);
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    content: stripped,
                  };
                  return copy;
                });
              } else if (event.type === "message_complete") {
                parsed = parseResponse(event.text);
              } else if (event.type === "error") {
                console.error("Stream error:", event.error);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }

        // Finalize the assistant message with parsed data
        if (parsed) {
          // If we got recommendations, fetch product data
          let products: RecommendedProduct[] | undefined;
          if (parsed.recommendations && parsed.recommendations.length > 0) {
            products = await fetchRecommendedProducts(parsed.recommendations);
          }

          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              content: parsed!.displayText,
              options: parsed!.options ?? undefined,
              products: products ?? undefined,
              type: products
                ? "products"
                : parsed!.options
                  ? "interactive"
                  : "text",
            };
            return copy;
          });

          // Auto-trigger recommend phase
          if (parsed.readyToRecommend) {
            setPhase("recommend");
            const allMsgs = [...updatedMessages, { ...assistantMsg, content: parsed.displayText }];
            setIsStreaming(false);
            sendRecommend(allMsgs);
            return;
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: "Sorry, something went wrong. Please try again.",
          };
          return copy;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [customerImage, sendRecommend],
  );

  // Send the initial prompt on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    sendMessage(initialPrompt, [], "consult");
  }, [initialPrompt, sendMessage]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text, messages, phase);
  };

  const handleOptionSelect = (value: string) => {
    if (isStreaming) return;

    // Mark option as selected
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].options) {
          copy[i] = {
            ...copy[i],
            options: copy[i].options!.map((opt: InteractiveOption) =>
              opt.value === value ? { ...opt, selected: true } : opt,
            ),
          };
          break;
        }
      }
      return copy;
    });

    // Find the label for display
    let label = value;
    for (let i = messages.length - 1; i >= 0; i--) {
      const opt = messages[i].options?.find((o) => o.value === value);
      if (opt) {
        label = opt.label;
        break;
      }
    }

    sendMessage(label, messages, phase);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">AuraFit</span>
        <button
          type="button"
          onClick={onStartOver}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          Start over
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onOptionSelect={handleOptionSelect}
              isStreaming={
                isStreaming && i === messages.length - 1 && msg.role === "assistant"
              }
              optionsDisabled={isStreaming}
            />
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="flex-1 rounded-full border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#ccc]"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
