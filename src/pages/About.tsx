import { Seo } from "@/components/Seo";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does pricing work?",
    a: "Plans start at ₹999/mo for Starter (300 emails, 1 inbox), ₹2,999/mo for Growth (1,500 emails, auto-send, Slack + webhooks), and ₹7,999/mo for Scale (10,000 emails, unlimited inboxes). Save 20% on yearly billing. Cancel anytime — no setup fees, no hidden charges.",
  },
  {
    q: "How do you handle data privacy?",
    a: "Your emails and knowledge base stay yours. We store data with row-level security so only your account can access it, encrypt credentials at rest, and never train shared models on your content. You can disconnect an inbox or delete your account at any time and your data is removed.",
  },
  {
    q: "How do approvals and auto-send work?",
    a: "You choose the level of automation per category. In draft mode the AI prepares a reply and waits for you to click send. In auto-send mode replies go out only when the AI's confidence is above the threshold you set, and there's a configurable unsend window (30s–2m) before delivery. Angry or high-risk threads always escalate to a human, regardless of mode.",
  },
];

export default function About() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0A0A0F", color: "rgba(255,255,255,0.85)" }}>
      <Seo
        title="About Dutaly — AI helpdesk for customer email"
        description="Dutaly is an AI helpdesk that turns customer emails into structured tickets and grounded replies from your knowledge base. Learn how it works and who it's for."
        path="/about"
      />
      <LandingNavbar />

      <main className="max-w-[760px] mx-auto px-6 pt-32 pb-24">
        <p className="text-[12px] uppercase tracking-[0.18em] mb-4" style={{ color: "#7C6FE0" }}>
          About
        </p>
        <h1 className="text-[44px] md:text-[56px] leading-[1.05] font-medium tracking-tight mb-8" style={{ color: "white" }}>
          We build AI agents that handle your inbox.
        </h1>

        <div className="space-y-6 text-[16px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.7)" }}>
          <p>
            Dutaly is an AI helpdesk built for small support teams who want to scale without hiring.
            We connect to Gmail or any standard IMAP/SMTP inbox, read every incoming customer email,
            and turn the noise into structured tickets your team can actually work with.
          </p>
          <p>
            Every reply is grounded in your knowledge base — your docs, FAQs, help pages, and policies.
            The AI doesn't guess. If there's no source for an answer, it surfaces the gap so you can fill it,
            and routes the conversation to a human in the meantime. Angry customers and high-risk threads
            are escalated automatically.
          </p>
          <p>
            You stay in control. Set confidence thresholds per category, choose between draft-only or
            fully automated replies, define a quiet "unsend window" before anything goes out, and add
            instructions that shape the AI's tone and rules. Nothing happens that you didn't approve in advance.
          </p>
          <p>
            The name <span style={{ color: "white" }}>Duta (दूत)</span> means messenger or agent in Sanskrit.
            Email is where we started. The mission is bigger: AI agents that handle your business communication,
            end to end, with the judgment you'd expect from a teammate who's been there for years.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-px mt-16 border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)" }}>
          {[
            { k: "Grounded", v: "Every reply cites your knowledge base. No hallucinations." },
            { k: "Controlled", v: "Per-category thresholds, approval mode, and unsend window." },
            { k: "Safe", v: "Angry or risky threads escalate to a human automatically." },
          ].map((item) => (
            <div key={item.k} className="p-6" style={{ background: "#0A0A0F" }}>
              <p className="text-[13px] font-medium mb-2" style={{ color: "white" }}>{item.k}</p>
              <p className="text-[13px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.5)" }}>{item.v}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-16">
          <Link to="/signup">
            <Button className="h-11 px-6 text-white border-0" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
              Start free
            </Button>
          </Link>
          <Link to="/pricing" className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            See pricing →
          </Link>
        </div>

        <section className="mt-20" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-[28px] md:text-[32px] font-medium tracking-tight mb-6" style={{ color: "white" }}>
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <AccordionTrigger className="text-left text-[15px] font-medium py-5 hover:no-underline" style={{ color: "white" }}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-[1.7] pb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
