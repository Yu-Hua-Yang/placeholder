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
    <div className={`animate-fade-in flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[90%] flex-col gap-2 sm:max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-[20px] rounded-br-sm bg-black text-white dark:bg-white dark:text-black"
              : "rounded-[20px] rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          }`}
        >
          {isStreaming && !message.content ? (
            <span className="flex items-center gap-1 py-1 text-zinc-400 dark:text-zinc-500">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {isStreaming && (
                <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current align-middle" />
              )}
            </>
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

        {message.type === "loading" && (
          <div className="grid w-full grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="skeleton aspect-square" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
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
