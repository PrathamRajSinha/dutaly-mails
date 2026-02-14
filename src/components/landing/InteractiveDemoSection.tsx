import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const tabs = [
  { label: "Incoming Email", key: "incoming" },
  { label: "AI Analysis", key: "analysis" },
  { label: "Draft Reply", key: "reply" },
];

const typingText = "Thank you for reaching out regarding your subscription. I've checked your account and can confirm that your Pro plan renewal has been processed successfully. Your next billing date is March 14, 2026. Let me know if you need anything else!";

export function InteractiveDemoSection() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [typedChars, setTypedChars] = useState(0);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (activeTab === "reply") {
      setTypedChars(0);
      const interval = setInterval(() => {
        setTypedChars((prev) => {
          if (prev >= typingText.length) { clearInterval(interval); return prev; }
          return prev + 2;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "analysis") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Auto-cycle tabs
  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = tabs.findIndex((t) => t.key === prev);
        return tabs[(idx + 1) % tabs.length].key;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section id="demo" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-indigo-400">How it works</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Watch the magic happen</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="demo-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 sm:p-8 min-h-[280px]">
              <AnimatePresence mode="wait">
                {activeTab === "incoming" && (
                  <motion.div key="incoming" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">From:</span>
                        <span className="text-white">john.doe@company.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">Subject:</span>
                        <span className="text-white font-medium">Question about subscription renewal</span>
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-white/5 text-sm text-zinc-300 leading-relaxed">
                        Hi there, I wanted to check on the status of my Pro subscription renewal. 
                        Can you confirm if it went through? Also, when is my next billing date? Thanks!
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "analysis" && (
                  <motion.div key="analysis" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-zinc-400">Analyzing email...</span>
                          <span className="text-indigo-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      {progress > 30 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Intent: Billing inquiry
                        </motion.div>
                      )}
                      {progress > 60 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Confidence: 96%
                        </motion.div>
                      )}
                      {progress > 80 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Knowledge base match found
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                {activeTab === "reply" && (
                  <motion.div key="reply" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="p-4 rounded-xl bg-white/5 text-sm text-zinc-300 leading-relaxed min-h-[120px]">
                      {typingText.slice(0, typedChars)}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Ready to send
                      </div>
                      <span className="text-xs text-zinc-500">96% confidence score</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
