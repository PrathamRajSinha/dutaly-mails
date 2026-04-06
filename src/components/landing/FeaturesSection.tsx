import { motion } from "framer-motion";
import { ClassificationMockup, ReplyMockup, DashboardMockup, AskAnythingMockup } from "./FeatureMockups";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 sm:py-36 relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div {...fade} className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Features</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[600px] mx-auto">
            A <span style={{ color: "#7C6FE0" }}>smarter</span> way to handle customer emails.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Classification — wide */}
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-7 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:scale-[1.015] hover:shadow-lg hover:border-zinc-300/80"
          >
            <div className="mb-5">
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.1)", color: "#7C6FE0" }}>
                Classification
              </span>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2] mb-2">
                Automatic classification
              </h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7] max-w-[440px]">
                Every email is categorized by intent, urgency, and sentiment — before anyone opens it.
              </p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-zinc-200/50">
              <ClassificationMockup />
            </div>
          </motion.div>

          {/* AI Replies — narrow */}
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:scale-[1.015] hover:shadow-lg hover:border-zinc-300/80"
          >
            <div className="mb-5">
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.1)", color: "#7C6FE0" }}>
                AI Replies
              </span>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2] mb-2">
                Smart reply & auto-send
              </h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7] max-w-[440px]">
                AI drafts replies <em>powered by your rules</em>. High-confidence ones send automatically — the rest queue for review.
              </p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-zinc-200/50">
              <ReplyMockup />
            </div>
          </motion.div>

          {/* Ask Anything — narrow */}
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:scale-[1.015] hover:shadow-lg hover:border-zinc-300/80"
          >
            <div className="mb-5">
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.1)", color: "#7C6FE0" }}>
                Intelligence
              </span>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2] mb-2">
                Ask anything about your emails
              </h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7] max-w-[440px]">
                Chat with AI about your inbox. Get instant answers with direct references to the emails behind every insight.
              </p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-zinc-200/50">
              <AskAnythingMockup />
            </div>
          </motion.div>

          {/* Dashboard — wide */}
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:scale-[1.015] hover:shadow-lg hover:border-zinc-300/80"
          >
            <div className="mb-5">
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.1)", color: "#7C6FE0" }}>
                Visibility
              </span>
              <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold text-zinc-900 tracking-[-0.02em] leading-[1.2] mb-2">
                Full visibility & tracking
              </h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7] max-w-[440px]">
                Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.
              </p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-zinc-200/50">
              <DashboardMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
