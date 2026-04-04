"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";

export default function Home() {
  const [submittedData, setSubmittedData] = useState<{
    image: string;
    prompt: string;
  } | null>(null);

  if (submittedData) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-zinc-500">Chat UI coming soon...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          What can I help you find?
        </h1>
        <PhotoUpload
          onSubmit={(image, prompt) => setSubmittedData({ image, prompt })}
        />
      </div>
    </div>
  );
}
