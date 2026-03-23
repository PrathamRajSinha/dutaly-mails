import { motion } from "framer-motion";
import { ClassificationMockup, ReplyMockup, DashboardMockup } from "./FeatureMockups";

const featureBlocks = [
  {
    visual: <ClassificationMockup />,
    title: "Automatic classification",
    text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it.",
    sub: "Intelligent escalation — low-confidence replies and angry customers are flagged instantly.",
  },
  {
    visual: <ReplyMockup />,
    title: "Smart reply generation",
    text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically.",
    sub: "Automation with control — set confidence thresholds per category. Define when AI acts and when it defers.",
  },
  {
    visual: <DashboardMockup />,
    title: "Full visibility & tracking",
    text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.",
    sub: "Slack integration — get notified when tickets need attention. Stay in the loop without switching tabs.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Features</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px]">
            A smarter way to handle customer emails.
          </h2>
        </motion.div>

        <div className="space-y-24 sm:space-y-32">
          {featureBlocks.map((block, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={`grid md:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-center ${
                  isReversed ? "md:[direction:rtl]" : ""
                }`}
              >
                {/* Visual */}
                <div className="[direction:ltr] relative">
                  <div className="shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]  rounded-xl overflow-hidden">
                    {block.visual}
                  </div>
                </div>

                {/* Text */}
                <div className="[direction:ltr] space-y-5">
                  <h3 className="text-[clamp(1.4rem,2.5vw,1.75rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2]">
                    {block.title}
                  </h3>
                  <p className="text-[15px] text-zinc-500 leading-[1.8] max-w-[440px]">
                    {block.text}
                  </p>
                  <p className="text-[14px] text-zinc-400 leading-[1.7] max-w-[440px] border-l-2 border-zinc-200 pl-4">
                    {block.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
