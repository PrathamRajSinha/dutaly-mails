import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Zap, Shield, BookOpen, Mail, Settings } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Replies",
    description: "Understands context and tone to draft perfect responses based on your knowledge base.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Emails are analyzed and replies generated in seconds, not minutes.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Smart Escalation",
    description: "Automatically escalates emails that need human attention based on your custom rules.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Upload documents, FAQs, and guides. The AI learns your business inside out.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Mail,
    title: "Multi-Account Support",
    description: "Connect Gmail, Outlook, or any IMAP account. Manage all inboxes in one place.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Settings,
    title: "Custom Instructions",
    description: "Define tone, rules, and constraints. The AI follows your exact playbook.",
    color: "from-rose-500 to-red-500",
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
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-indigo-400">Features</span>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              automate email
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
            A complete AI email assistant that learns from your knowledge base and follows your rules.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof features)[0];
  index: number;
  isInView: boolean;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouse}
      className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 hover:border-white/10 transition-colors duration-300 overflow-hidden"
    >
      {/* Mouse follow glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 40%)`,
        }}
      />

      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}
