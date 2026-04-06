import { PricingSection } from "@/components/landing/PricingSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Pricing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0A0A0F" }}>
      <LandingNavbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <FooterSection />
    </div>
  );
}
