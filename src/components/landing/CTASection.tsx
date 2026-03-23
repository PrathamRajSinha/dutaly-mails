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
    <section className="py-28 sm:py-36 border-t border-white/[0.04]" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
        className="max-w-[560px] mx-auto px-6 text-center"
      >
        <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
          Never miss a customer email again.
        </h2>
        <p className="mt-4 text-zinc-500 text-[15px]">
          Turn messy inboxes into structured support. Start in minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to={ctaLink}>
            <Button className="h-11 px-7 text-[14px] bg-white text-zinc-900 hover:bg-zinc-200 rounded-lg font-medium">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
