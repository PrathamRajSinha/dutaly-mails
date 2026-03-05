import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, MessageSquareReply, Clock, Webhook } from "lucide-react";
import screenshotTickets from "@/assets/screenshot-tickets.png";
import screenshotAiReply from "@/assets/screenshot-ai-reply.png";

const features = [
  {
    icon: Brain,
    title: "Smart Classification",
    description: "Incoming emails are automatically categorized by intent, urgency, and sentiment — no manual triage needed.",
    screenshot: screenshotTickets,
    screenshotAlt: "dyuticAI ticket classification showing priority and status columns",
  },
  {
    icon: MessageSquareReply,
    title: "AI-Drafted Replies",
    description: "Replies are drafted instantly using your knowledge base and custom rules. Review, edit, or auto-send with confidence scores.",
    screenshot: screenshotAiReply,
    screenshotAlt: "dyuticAI AI reply drafting interface with confidence score and approve buttons",
  },
];

const smallFeatures = [
  {
    icon: Clock,
    title: "SLA Tracking",
    description: "Set response and resolution deadlines. Get alerts before breaches happen.",
  },
  {
    icon: Webhook,
    title: "Integrations",
    description: "Connect Slack, webhooks, and external systems to your support workflow.",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-400 mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Everything you need to<br className="hidden sm:block" /> manage support at scale.
          </h2>
        </motion.div>

        {/* Large feature blocks with screenshots */}
        <div className="space-y-24">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isReversed = i % 2 !== 0;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-16`}
              >
                {/* Text */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-5 mx-auto lg:mx-0">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                    {feature.description}
                  </p>
                </div>
                {/* Screenshot */}
                <div className="flex-1 w-full">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                    <img
                      src={feature.screenshot}
                      alt={feature.screenshotAlt}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Smaller feature cards */}
        <div className="grid sm:grid-cols-2 gap-8 mt-24">
          {smallFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900/60 border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[15px] text-zinc-500 leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
