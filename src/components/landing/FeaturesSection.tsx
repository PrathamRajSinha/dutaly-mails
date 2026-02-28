import { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, MessageSquareReply, Clock, Webhook } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligent Classification",
    description: "Automatically categorize emails and detect sentiment.",
    spotlightColor: "rgba(129, 140, 248, 0.15)",
    iconBg: "from-indigo-500 to-blue-600",
  },
  {
    icon: MessageSquareReply,
    title: "AI Reply Engine",
    description: "Generate accurate responses based on your knowledge base and rules.",
    spotlightColor: "rgba(168, 85, 247, 0.15)",
    iconBg: "from-purple-500 to-violet-600",
  },
  {
    icon: Clock,
    title: "SLA Monitoring",
    description: "Track response and resolution deadlines automatically.",
    spotlightColor: "rgba(251, 191, 36, 0.15)",
    iconBg: "from-amber-400 to-orange-500",
  },
  {
    icon: Webhook,
    title: "Integrations",
    description: "Connect Slack or external systems via webhooks.",
    spotlightColor: "rgba(52, 211, 153, 0.12)",
    iconBg: "from-emerald-400 to-green-500",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-medium text-indigo-400 mb-3 tracking-wider uppercase">
            Solution
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            A Structured,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Customer Inbox
            </span>
          </h2>
          <p className="mt-5 text-zinc-400 max-w-2xl mx-auto text-lg">
            MailReplAI connects directly to your existing inbox and transforms support emails into structured, trackable tickets — powered by configurable AI.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-1">
          {features.map((feature, i) => (
            <SpotlightCard key={feature.title} feature={feature} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof features)[0];
  index: number;
  isInView: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseEnter = useCallback(() => setOpacity(1), []);
  const handleMouseLeave = useCallback(() => setOpacity(0), []);

  const Icon = feature.icon;

  return (
    <motion.div
      ref={divRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 overflow-hidden transition-colors duration-500 hover:border-white/[0.12]"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${feature.spotlightColor}, transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-500"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${feature.spotlightColor}, transparent 40%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
        <p className="text-[15px] text-zinc-400 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}
