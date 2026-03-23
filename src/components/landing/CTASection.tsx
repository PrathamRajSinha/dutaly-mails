import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0, 1] }}
        className="relative max-w-[600px] mx-auto px-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
          Never miss a customer<br className="hidden sm:block" /> email again.
        </h2>
        <p className="mt-5 text-base text-zinc-500 max-w-md mx-auto">
          Turn messy inboxes into structured support. Start in minutes.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ctaLink}>
            <Button className="h-11 px-7 text-[14px] bg-white text-zinc-900 hover:bg-zinc-200 rounded-full font-semibold shadow-lg shadow-white/[0.06] transition-all duration-300">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="mailto:hello@dyuticai.com">
            <Button variant="ghost" className="h-11 px-7 text-[14px] text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-full transition-all duration-300">
              Book a demo
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
