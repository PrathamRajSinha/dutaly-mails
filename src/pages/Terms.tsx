import { Link } from "react-router-dom";
import logoAsset from "@/assets/dutaly-mails-logo.png.asset.json";
const logoDarkBg = logoAsset.url;
import { Seo } from "@/components/Seo";

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "rgba(255,255,255,0.85)" }}>
      <Seo
        title="Terms and Conditions — Dutaly"
        description="The terms governing your use of Dutaly's AI helpdesk service."
        path="/terms"
      />
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-[880px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/mails"><img src={logoDarkBg} alt="Dutaly" className="h-9 w-auto" /></Link>
          <Link to="/mails" className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>← Back</Link>
        </div>
      </header>
      <article className="max-w-[800px] mx-auto px-6 py-16">
        <h1 className="text-[36px] font-semibold mb-2 text-white">Terms and Conditions</h1>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Effective Date: April 2026 · Last Updated: April 2026</p>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
          <p>Welcome to Dutaly ("Company", "we", "us", or "our"). Please read these Terms and Conditions ("Terms") carefully before using our website, application, or any related services (collectively, the "Service").</p>
          <p>By accessing or using our Service, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not access or use the Service.</p>

          <Section title="1. Use of the Service">
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul>
              <li>Violate any applicable laws or regulations;</li>
              <li>Infringe upon the rights of others;</li>
              <li>Upload or share harmful, misleading, or unlawful content;</li>
              <li>Use Dutaly to send spam, phishing, or deceptive communications;</li>
              <li>Attempt to interfere with or disrupt the Service, servers, or networks connected to it.</li>
            </ul>
          </Section>

          <Section title="2. Intellectual Property">
            <p>All content, code, design elements, logos, and materials made available through the Service are the property of Dutaly or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, modify, distribute, display, or create derivative works from any part of the Service without our prior written consent.</p>
          </Section>

          <Section title="3. User Accounts">
            <ul>
              <li>Provide accurate and up-to-date information;</li>
              <li>Maintain the confidentiality of your login credentials;</li>
              <li>Notify us immediately of any unauthorized access or use of your account.</li>
            </ul>
            <p>We are not liable for any loss or damage arising from your failure to maintain the security of your account.</p>
          </Section>

          <Section title="4. Payments and Refunds">
            <p>All payments made through the Service are final. Refunds are governed by our <Link to="/refund" className="underline" style={{ color: "#7C6FE0" }}>Refund Policy</Link>. By using our payment systems, you agree to comply with the terms of any third-party payment processors we may use (including Razorpay).</p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>To the fullest extent permitted by law, Dutaly and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use or inability to use the Service, including but not limited to data loss, business interruption, missed or incorrect AI-generated replies, or system failures.</p>
          </Section>

          <Section title="6. Disclaimer">
            <p>The Service is provided on an "as is" and "as available" basis without warranties of any kind, express or implied. AI-generated replies may contain errors; you are responsible for reviewing and approving outgoing communication. We do not guarantee that the Service will be uninterrupted, secure, or error-free. You use the Service at your own risk.</p>
          </Section>

          <Section title="7. Termination">
            <p>We reserve the right to suspend or terminate your access to the Service at our discretion, without notice, if we believe you have violated these Terms or engaged in harmful behavior toward the platform or other users.</p>
          </Section>

          <Section title="8. Changes to These Terms">
            <p>We may update these Terms from time to time. Any changes will be posted on this page with the revised effective date. Your continued use of the Service after such changes constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions, feedback, or concerns about these Terms, please contact:</p>
            <div className="mt-2 p-5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-semibold text-white">Dutaly</p>
              <p>📧 <a href="mailto:pratham@dutaly.com" className="underline" style={{ color: "rgba(255,255,255,0.85)" }}>pratham@dutaly.com</a></p>
              <p>📞 +91 9148253924</p>
              <p>📍 Bengaluru, Karnataka 560072, India</p>
            </div>
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
