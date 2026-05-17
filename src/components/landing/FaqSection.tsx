import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does Dutaly actually work?",
    a: "Dutaly connects to your inbox over Gmail OAuth or IMAP/SMTP and reads every incoming customer email in near real time. Each message is classified by intent, category, and sentiment, turned into a structured ticket, and matched against your knowledge base. The AI then drafts a reply grounded in your sources — or sends it automatically if you've enabled auto-send for that category.",
  },
  {
    q: "How long does setup take?",
    a: "About 5 minutes. Connect your inbox, point us at your help docs or paste your FAQs, and the AI starts drafting replies on the next incoming email. No engineering or migration required.",
  },
  {
    q: "Which email providers do you support?",
    a: "Gmail via OAuth, and any standard IMAP/SMTP inbox (Zoho, Fastmail, custom domains, hosted email). Outlook is not currently supported.",
  },
  {
    q: "Where does the AI get its answers from?",
    a: "Only from your knowledge base — uploaded PDFs, Word/PPT docs, pasted FAQs, and help-center URLs we crawl for you. The AI is explicitly instructed not to guess. If there's no source for a question, it surfaces a knowledge-gap suggestion so you can fill it, and routes the conversation to a human in the meantime.",
  },
  {
    q: "How do approvals and auto-send work?",
    a: "You choose the level of automation per category. In draft mode the AI prepares a reply and waits for you to click send. In auto-send mode replies go out only when the AI's confidence is above the threshold you set, and there's a configurable unsend window (30s–2m) before delivery. Angry or high-risk threads always escalate to a human, regardless of mode.",
  },
  {
    q: "What happens with angry or high-risk emails?",
    a: "Sentiment is scored on every message. Anything below 0.3 (angry, frustrated, threatening to churn) is automatically escalated: auto-replies are paused on that thread, the ticket is flagged for human review, and you can route a notification to Slack or a webhook. You can also define custom keyword triggers that force escalation.",
  },
  {
    q: "Can I control the AI's tone and rules?",
    a: "Yes. The instruction builder lets you write DO and DON'T rules with priorities — things like \"always offer a refund for orders under ₹500\" or \"never promise delivery dates\". You can also set per-category confidence thresholds, choose templates, and tune the unsend window. The AI follows your instructions strictly.",
  },
  {
    q: "How do you handle data privacy?",
    a: "Your emails and knowledge base stay yours. We store data with row-level security so only your account can access it, encrypt credentials at rest, and never train shared models on your content. You can disconnect an inbox or delete your account at any time and your data is removed.",
  },
  {
    q: "How does pricing work?",
    a: "Plans start at ₹999/mo for Starter (300 emails, 1 inbox), ₹2,999/mo for Growth (1,500 emails, auto-send, Slack + webhooks), and ₹7,999/mo for Scale (10,000 emails, unlimited inboxes). Save 20% on yearly billing. Cancel anytime — no setup fees, no hidden charges.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24 md:py-32" style={{ background: "#0A0A0F" }} aria-labelledby="landing-faq-heading">
      <div className="max-w-[760px] mx-auto px-6">
        <p className="text-[12px] uppercase tracking-[0.18em] mb-4" style={{ color: "#7C6FE0" }}>
          FAQ
        </p>
        <h2 id="landing-faq-heading" className="text-[36px] md:text-[44px] leading-[1.1] font-medium tracking-tight mb-12" style={{ color: "white" }}>
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
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
      </div>
    </section>
  );
}
