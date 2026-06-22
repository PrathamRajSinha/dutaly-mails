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
