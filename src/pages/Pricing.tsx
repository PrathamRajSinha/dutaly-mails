import { Seo } from "@/components/Seo";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Pricing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0A0A0F" }}>
      <Seo
        title="Pricing — Dutaly"
        description="Simple plans for growing support teams. Starter, Growth, and Scale tiers with transparent monthly resolution limits."
        path="/pricing"
      />
      <LandingNavbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <FooterSection />
    </div>
  );
}
