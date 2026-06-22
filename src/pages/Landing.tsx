import { useEffect } from "react";
import Lenis from "lenis";
import { Seo } from "@/components/Seo";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

import { CTASection } from "@/components/landing/CTASection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Landing() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0A0A0F" }}>
      <Seo

        title="Dutaly — AI helpdesk that handles your inbox"
        description="Dutaly turns customer emails into structured tickets and replies with AI-powered precision so your team focuses on what actually needs judgment."
        path="/mails"
      />
      <LandingNavbar />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <StatsSection />
      <TestimonialsSection />
      
      <FaqSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
