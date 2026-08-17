import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function CTASection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="relative overflow-hidden py-28 sm:py-36" style={{ background: "#0A0A0F" }}>
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20"
          style={{
            background: "linear-gradient(160deg, rgba(124,111,224,0.16) 0%, rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(124,111,224,0.22)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-64"
            style={{ background: "radial-gradient(50% 60% at 50% 50%, rgba(124,111,224,0.22) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <h2
              className="mx-auto max-w-[720px] text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.032em]"
              style={{ color: "#F7F6FC" }}
            >
              Let <span style={{ color: "#A89EF0" }}>Dutaly</span> handle your inbox.
            </h2>
            <p className="mx-auto mt-6 max-w-[540px] text-[16.5px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.52)" }}>
              Connect your inbox and let Dutaly handle emails automatically — while you stay in control.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ctaLink} className="w-full sm:w-auto">
                <Button
                  className="font-display h-12 w-full px-8 text-[14.5px] font-semibold text-white transition-all duration-300 sm:w-auto"
                  style={{ background: "#7C6FE0", borderRadius: "8px", boxShadow: "0 14px 40px -14px rgba(124,111,224,0.85)" }}
                >
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                to="/pricing"
                className="font-display inline-flex h-12 items-center justify-center rounded-lg px-6 text-[14px] font-medium"
                style={{ color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                See pricing
              </Link>
            </div>
            <p className="mt-6 text-[13px]" style={{ color: "rgba(255,255,255,0.32)" }}>No credit card required.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
