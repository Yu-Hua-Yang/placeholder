"use client";

import { useState } from "react";
import LandingPage from "@/components/wizard/LandingPage";
import WizardShell from "@/components/wizard/WizardShell";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  return <WizardShell />;
}
