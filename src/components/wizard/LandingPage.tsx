"use client";

import { useEffect } from "react";
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

export default function LandingPage({ onStartWithGoal }: LandingPageProps) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white">
      <NavBar onStart={() => {
        const el = document.getElementById("hero-input");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el?.focus(), 400);
      }} />
      <HeroSection onStartWithGoal={onStartWithGoal} />
      <BrandSection onStartWithGoal={onStartWithGoal} />
      <Divider />
      <ShowcaseSection onStartWithGoal={onStartWithGoal} />
      <Divider />
      <HowItWorksSection />
      <FinalCTASection onStart={() => {
        const el = document.getElementById("hero-input");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el?.focus(), 400);
      }} />
      <Footer />
    </div>
  );
}
