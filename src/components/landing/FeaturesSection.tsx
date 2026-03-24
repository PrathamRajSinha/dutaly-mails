import { motion } from "framer-motion";
import { ClassificationMockup, ReplyMockup, DashboardMockup } from "./FeatureMockups";

const featureBlocks = [
  {
    visual: <ClassificationMockup />,
    label: "Classification",
    title: "Automatic classification",
    text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it.",
    sub: "Intelligent escalation — low-confidence replies and angry customers are flagged instantly.",
  },
  {
    visual: <ReplyMockup />,
    label: "AI Replies",
    title: "Smart reply generation",
    text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically.",
    sub: "Automation with control — set confidence thresholds per category. Define when AI acts and when it defers.",
  },
  {
    visual: <DashboardMockup />,
    label: "Visibility",
    title: "Full visibility & tracking",
    text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.",
    sub: "Slack integration — get notified when tickets need attention. Stay in the loop without switching tabs.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 sm:py-36 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-zinc-50/30 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Features</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[600px] mx-auto">
            A <span className="text-primary">smarter</span> way to handle customer emails.
          </h2>
        </motion.div>

        <div className="space-y-8">
          {featureBlocks.map((block, i) => {
            const isReversed = i % 2 !== 0;

            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white border border-zinc-200/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-6 sm:p-8 lg:p-10"
              >
                <div
                  className={`grid md:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-center ${
                    isReversed ? "md:[direction:rtl]" : ""
                  }`}
                >
                  <div className="[direction:ltr] relative group">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200/50">
                      {block.visual}
                    </div>
                  </div>

                  <div className="[direction:ltr] space-y-5">
                    <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-accent-foreground bg-accent px-3 py-1 rounded-full">
                      {block.label}
                    </span>
                    <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2]">
                      {block.title}
                    </h3>
                    <p className="text-[15px] text-zinc-500 leading-[1.8] max-w-[440px]">
                      {block.text}
                    </p>
                    <div className="border-l-2 border-zinc-200 pl-4">
                      <p className="text-[14px] text-zinc-400 leading-[1.7] max-w-[440px]">
                        {block.sub}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
