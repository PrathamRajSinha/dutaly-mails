import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { StarBorder } from "./StarBorder";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
          Stop Managing Support in Gmail Alone
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          Upgrade your inbox into an AI-powered helpdesk in minutes.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth">
            <StarBorder color="hsl(239, 84%, 67%)" speed="5s" thickness={2}>
              <Button className="h-12 px-8 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-2xl shadow-lg shadow-indigo-500/25">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </StarBorder>
          </Link>
          <a href="mailto:hello@mailreplai.com">
            <Button variant="ghost" className="h-12 px-8 text-base text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl border border-white/10">
              Book a Demo
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
