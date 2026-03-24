import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function CTASection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="py-32 sm:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-white pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[700px] mx-auto">
            Never miss a customer email again.
          </h2>
          <p className="mt-6 text-[17px] text-zinc-500 max-w-[480px] mx-auto leading-relaxed">
            Turn messy inboxes into structured support. Start in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-5">
            <Link to={ctaLink}>
              <Button className="h-12 px-8 text-[15px] bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-zinc-400">Free to start · No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
