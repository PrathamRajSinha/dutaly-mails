import { Link } from "react-router-dom";
import logoDarkBg from "@/assets/logo-dark-bg.png";
import { Seo } from "@/components/Seo";

export default function Refund() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "rgba(255,255,255,0.85)" }}>
      <Seo
        title="Refund Policy — Dutaly"
        description="The conditions under which refunds are processed for Dutaly subscriptions."
        path="/refund"
      />
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-[880px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/mails"><img src={logoDarkBg} alt="Dutaly" className="h-6 w-auto" /></Link>
          <Link to="/mails" className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>← Back</Link>
        </div>
      </header>
      <article className="max-w-[800px] mx-auto px-6 py-16">
        <h1 className="text-[36px] font-semibold mb-2 text-white">Refund Policy</h1>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Effective Date: April 2026 · Last Updated: April 2026</p>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
          <p>Thank you for choosing Dutaly ("we", "us", or "our"). This Refund Policy outlines the conditions under which refunds are processed for payments made through our website, application, or any associated services (collectively, the "Service").</p>

          <Section title="1. No Refunds for Digital Services">
            <p>All purchases made through Dutaly are for digital products or SaaS subscriptions that are delivered instantly or begin processing immediately upon payment. Accordingly, we do not offer refunds, cancellations, or exchanges once a payment has been completed, except where required by applicable law.</p>
          </Section>

          <Section title="2. Exceptions">
            <p>Refunds may be considered only in the following exceptional cases:</p>
            <ul>
              <li>Duplicate payment made by the user.</li>
              <li>Transaction charged but not successfully completed or delivered.</li>
              <li>Verified technical error from our end resulting in service failure.</li>
            </ul>
            <p>In such cases, users must contact us within 7 days of the transaction with proof of payment.</p>
          </Section>

          <Section title="3. Refund Processing Time">
            <p>If a refund request is approved, the amount will be credited to the original payment method within 7–10 business days, depending on your payment provider's policies.</p>
          </Section>

          <Section title="4. Third-Party Payment Gateways">
            <p>All transactions are handled securely through third-party payment processors such as Razorpay and other providers. We do not store or process your card or banking details directly. Any disputes regarding failed payments should first be raised with the payment processor, though we will assist where possible.</p>
          </Section>

          <Section title="5. Contact for Refund Requests">
            <p>For refund-related queries or issues, please contact:</p>
            <div className="mt-2 p-5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-semibold text-white">Dutaly</p>
              <p>📧 prathamrajsinha@gmail.com</p>
              <p>📞 +91 9148253924</p>
              <p>📍 Bengaluru, Karnataka 560072, India</p>
            </div>
            <p>Please include your transaction ID, payment receipt, and a brief description of the issue.</p>
          </Section>

          <Section title="6. Changes to This Policy">
            <p>We may update this Refund Policy from time to time. The updated version will be posted on this page with the revised date. Continued use of our services constitutes acceptance of the updated policy.</p>
          </Section>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[20px] font-semibold text-white mt-8">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1" style={{ color: "rgba(255,255,255,0.75)" }}>
        {children}
      </div>
    </section>
  );
}
