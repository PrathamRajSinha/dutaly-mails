import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const tabs = [
  { label: "Email Received", key: "received" },
  { label: "AI Classifies", key: "classifies" },
  { label: "Draft Generated", key: "draft" },
  { label: "You Approve", key: "approve" },
  { label: "SLA Tracked", key: "sla" },
];

const typingText = "Hi Sarah, thank you for reaching out about your order. I've looked into this and can confirm your refund has been processed — it should appear in your account within 3-5 business days. I've also flagged the packaging issue with our fulfillment team. Let me know if there's anything else I can help with!";

export function InteractiveDemoSection() {
  const [activeTab, setActiveTab] = useState("received");
  const [typedChars, setTypedChars] = useState(0);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (activeTab === "draft") {
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
    if (activeTab === "classifies") {
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
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">From Email to Resolution — Automatically</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/5 overflow-x-auto">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-1 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="mr-1.5 text-xs text-zinc-600">{i + 1}.</span>
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

            <div className="p-6 sm:p-8 min-h-[280px]">
              <AnimatePresence mode="wait">
                {activeTab === "received" && (
                  <motion.div key="received" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">From:</span>
                        <span className="text-white">sarah.m@customer.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">Subject:</span>
                        <span className="text-white font-medium">Damaged item received — requesting refund</span>
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-white/5 text-sm text-zinc-300 leading-relaxed">
                        Hi, I received my order #4821 today but the product arrived damaged. The packaging was crushed 
                        and the item inside is broken. I'd like a full refund please. This is really frustrating as I needed this for an event this weekend.
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "classifies" && (
                  <motion.div key="classifies" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
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
                      {progress > 25 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Intent: Refund request
                        </motion.div>
                      )}
                      {progress > 50 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Sentiment: Frustrated (negative)
                        </motion.div>
                      )}
                      {progress > 70 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Priority: High — Ticket #TK-0482 created
                        </motion.div>
                      )}
                      {progress > 90 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Knowledge base match: Refund policy found
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                {activeTab === "draft" && (
                  <motion.div key="draft" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="p-4 rounded-xl bg-white/5 text-sm text-zinc-300 leading-relaxed min-h-[120px]">
                      {typingText.slice(0, typedChars)}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Ready for review
                      </div>
                      <span className="text-xs text-zinc-500">94% confidence · Based on refund policy</span>
                    </div>
                  </motion.div>
                )}
                {activeTab === "approve" && (
                  <motion.div key="approve" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="space-y-4">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-sm text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> AI draft reviewed by agent
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-3">
                        <div className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          ✓ Approve & Send
                        </div>
                        <div className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-zinc-400 border border-white/10">
                          ✎ Edit
                        </div>
                        <div className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-zinc-400 border border-white/10">
                          ✗ Ignore
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }} className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-sm text-zinc-300 leading-relaxed">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 uppercase tracking-wider">Sent</div>
                          <span className="text-xs text-zinc-500">just now</span>
                        </div>
                        Reply delivered to sarah.m@customer.com
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "sla" && (
                  <motion.div key="sla" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="space-y-4">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-sm text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> First response SLA: Met (responded in 4 min)
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 text-sm text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Resolution SLA: 23h remaining
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <div className="mt-2 p-4 rounded-xl bg-white/5 text-sm space-y-2">
                          <div className="flex justify-between text-zinc-400">
                            <span>Ticket #TK-0482</span>
                            <span className="text-green-400">Active</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Category</span>
                            <span className="text-zinc-300">Refund</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Priority</span>
                            <span className="text-red-400">High</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Awaiting</span>
                            <span className="text-zinc-300">Customer confirmation</span>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-xs text-zinc-500 italic">
                        Ticket stays tracked until resolution. Breach alerts sent automatically.
                      </motion.div>
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
