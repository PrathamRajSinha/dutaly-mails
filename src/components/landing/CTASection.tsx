import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function CTASection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="py-32 sm:py-40 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold tracking-[-0.03em] leading-[1.1] max-w-[700px] mx-auto" style={{ color: "#F0EEF8" }}>
            <span style={{ color: "#7C6FE0" }}>Never</span> miss a customer email again.
          </h2>
          <p className="mt-6 text-[17px] max-w-[480px] mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Turn messy inboxes into structured support. Start in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-5">
            <Link to={ctaLink}>
              <Button className="h-12 px-8 text-[15px] text-white font-medium shadow-xl hover:shadow-2xl transition-all duration-300" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Free to start · No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
