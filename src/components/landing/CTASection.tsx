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
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Ready to transform<br className="hidden sm:block" /> your inbox?
        </h2>
        <p className="mt-4 text-lg text-zinc-500">
          Start managing customer support with structure, speed, and AI.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth">
            <Button className="h-12 px-8 text-base bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-semibold shadow-lg shadow-white/10">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="mailto:hello@dyuticai.com">
            <Button variant="ghost" className="h-12 px-8 text-base text-zinc-400 hover:text-white hover:bg-white/5 rounded-full">
              Book a Demo
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
