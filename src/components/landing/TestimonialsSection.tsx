import { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, ShoppingBag, Users, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "SaaS Startups",
    description: "Manage bug reports, billing issues, and feature requests effortlessly.",
    spotlightColor: "rgba(129, 140, 248, 0.15)",
    iconBg: "from-indigo-500 to-blue-600",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    description: "Handle refunds, complaints, and order queries faster.",
    spotlightColor: "rgba(251, 191, 36, 0.15)",
    iconBg: "from-amber-400 to-orange-500",
  },
  {
    icon: Users,
    title: "Agencies",
    description: "Organize client emails across shared inboxes with structure.",
    spotlightColor: "rgba(168, 85, 247, 0.15)",
    iconBg: "from-purple-500 to-violet-600",
  },
  {
    icon: Briefcase,
    title: "Service Businesses",
    description: "Turn email chaos into structured workflows that scale.",
    spotlightColor: "rgba(52, 211, 153, 0.12)",
    iconBg: "from-emerald-400 to-green-500",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="use-cases" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-indigo-400 mb-3 tracking-wider uppercase">
            Use Cases
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Built for Modern Growing Teams
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {useCases.map((uc, i) => (
            <UseCaseCard key={uc.title} useCase={uc} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({
  useCase,
  index,
  isInView,
}: {
  useCase: (typeof useCases)[0];
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

  const Icon = useCase.icon;

  return (
    <motion.div
      ref={divRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 overflow-hidden transition-colors duration-500 hover:border-white/[0.12]"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${useCase.spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${useCase.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{useCase.title}</h3>
        <p className="text-[15px] text-zinc-400 leading-relaxed">{useCase.description}</p>
      </div>
    </motion.div>
  );
}
