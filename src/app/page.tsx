"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import LandingPage from "@/components/wizard/LandingPage";

const WizardShell = dynamic(() => import("@/components/wizard/WizardShell"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="spinner" />
    </div>
  ),
});

export default function Home() {
  const [goal, setGoal] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const pendingGoal = useRef<string | null>(null);

  const handleStartWithGoal = (g: string) => {
    pendingGoal.current = g;
    setTransitioning(true);
    setTimeout(() => {
      setGoal(pendingGoal.current);
    }, 300);
  };

  if (!goal) {
    return (
      <div className={transitioning ? "animate-fade-out" : ""}>
        <LandingPage onStartWithGoal={handleStartWithGoal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 animate-fade-in">
      <WizardShell initialGoal={goal} onStartOver={() => { setTransitioning(false); setGoal(null); }} />
    </div>
  );
}
