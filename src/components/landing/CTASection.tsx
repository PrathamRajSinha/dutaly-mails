import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function CTASection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-28 border-t" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end"
        >
          <div className="md:col-span-8">
            <span className="text-[10px] uppercase tracking-[0.22em] block mb-7" style={{ color: "rgba(237,235,245,0.35)" }}>
              Ready when you are
            </span>
            <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
              Let Dutaly <span className="italic">handle your inbox.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:pl-10 md:border-l" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
            <p className="text-[15px] leading-[1.8] mb-8" style={{ color: "rgba(237,235,245,0.55)" }}>
              Connect your inbox and let Dutaly handle emails automatically — while you stay in control.
            </p>
            <Link to={ctaLink}>
              <button
                className="px-10 py-4 text-[13px] font-medium text-white transition-all hover:brightness-110"
                style={{ background: "#6E62C4" }}
              >
                Start free
              </button>
            </Link>
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(237,235,245,0.3)" }}>
              No credit card required.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
