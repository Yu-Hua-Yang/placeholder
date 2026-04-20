"use client";

import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BrandSection from "@/components/landing/BrandSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

interface LandingPageProps {
  onStartWithGoal: (goal: string) => void;
}

function Divider() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-12 lg:px-20">
      <hr className="border-zinc-200" />
    </div>
  );
}

function scrollToHeroInput() {
  const el = document.getElementById("hero-input");
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => el?.focus(), 400);
}

export default function LandingPage({ onStartWithGoal }: LandingPageProps) {
  return (
    <div className="bg-white">
      <NavBar onStart={scrollToHeroInput} />
      <HeroSection onStartWithGoal={onStartWithGoal} />
      <BrandSection onStartWithGoal={onStartWithGoal} />
      <Divider />
      <ShowcaseSection onStartWithGoal={onStartWithGoal} />
      <Divider />
      <HowItWorksSection />
      <FinalCTASection onStart={scrollToHeroInput} />
      <Footer />
    </div>
  );
}
