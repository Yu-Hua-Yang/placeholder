"use client";

import type { Message, RecommendedProduct } from "@/lib/types";
import InteractiveOptions from "./InteractiveOptions";
import ProductGrid from "./ProductGrid";

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (value: string) => void;
  isStreaming?: boolean;
  optionsDisabled?: boolean;
}

export default function MessageBubble({
  message,
  onOptionSelect,
  isStreaming,
  optionsDisabled,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-foreground text-background"
              : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current align-middle" />
          )}
        </div>

        {message.options && message.options.length > 0 && onOptionSelect && (
          <div className="w-full pt-1">
            <InteractiveOptions
              options={message.options}
              onSelect={onOptionSelect}
              disabled={optionsDisabled}
            />
          </div>
        )}

        {message.products && message.products.length > 0 && (
          <div className="w-full pt-1">
            <ProductGrid products={message.products as RecommendedProduct[]} />
          </div>
        )}
      </div>
    </div>
  );
}
