"use client";

import { useState } from "react";
import LandingPage from "@/components/wizard/LandingPage";
import WizardShell from "@/components/wizard/WizardShell";

export default function Home() {
  const [goal, setGoal] = useState<string | null>(null);

  if (!goal) {
    return <LandingPage onStartWithGoal={setGoal} />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <WizardShell initialGoal={goal} onStartOver={() => setGoal(null)} />
    </div>
  );
}
