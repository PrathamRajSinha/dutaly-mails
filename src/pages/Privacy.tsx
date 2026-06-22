import { Link } from "react-router-dom";
import logoDarkBg from "@/assets/logo-dark-bg.png";
import { Seo } from "@/components/Seo";

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "rgba(255,255,255,0.85)" }}>
      <Seo
        title="Privacy Policy — Dutaly"
        description="How Dutaly collects, uses, and safeguards your information when you use our AI helpdesk service."
        path="/privacy"
      />
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-[880px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/mails"><img src={logoDarkBg} alt="Dutaly" className="h-6 w-auto" /></Link>
          <Link to="/mails" className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>← Back</Link>
        </div>
      </header>
      <article className="max-w-[800px] mx-auto px-6 py-16 prose-invert">
        <h1 className="text-[36px] font-semibold mb-2 text-white">Privacy Policy</h1>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Effective Date: June 2026 · Last Updated: June 2026</p>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
          <p>At Dutaly ("Company", "we", "us", or "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit or use our website, application, or any related services (collectively, the "Service").</p>
          <p>By using our Service, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the Service.</p>

          <Section title="1. Information We Collect">
            <p>We may collect both personal and non-personal information, including:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Billing or payment details (through secure third-party processors)</li>
              <li>IP address, browser type, and operating system</li>
              <li>Device identifiers and approximate location data</li>
              <li>Pages viewed, interaction data, and session analytics</li>
              <li>Email content and metadata processed through connected mailboxes (Gmail, IMAP) for the purpose of providing AI-powered replies</li>
            </ul>
          </Section>

          <Section title="2. How We Collect Information">
            <ul>
              <li>When you register or create an account on our platform</li>
              <li>When you make payments or complete transactions</li>
              <li>When you fill out forms, contact us, or use our services</li>
              <li>When you connect a Gmail or IMAP mailbox to Dutaly</li>
              <li>Automatically through cookies and similar tracking technologies</li>
              <li>From third-party integrations or service providers (e.g., analytics tools, payment gateways)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>Provide and operate our AI email handling services</li>
              <li>Process transactions and deliver purchased products or services</li>
              <li>Communicate with you about updates, offers, or support</li>
              <li>Improve website functionality and user experience</li>
              <li>Detect, prevent, and address fraud or security issues</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </Section>

          <Section title="4. Sharing of Information">
            <p>We do not sell or rent your personal information. We may share limited data with:</p>
            <ul>
              <li>Trusted third parties who help us operate our Service (e.g., hosting, payment processing, analytics, AI model providers)</li>
              <li>Regulatory authorities if required by law or legal process</li>
              <li>Legal representatives in case of disputes or compliance investigations</li>
            </ul>
            <p>All third parties are required to keep your information secure and use it only for the purposes we specify.</p>
          </Section>

          <Section title="5. Cookies and Tracking Technologies">
            <ul>
              <li>Enhance your experience and personalize content</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Store session and login preferences</li>
            </ul>
            <p>You can disable cookies through your browser settings; however, some features of the Service may not function properly.</p>
          </Section>

          <Section title="6. Data Security">
            <ul>
              <li>SSL (Secure Socket Layer) encryption in transit</li>
              <li>Row-level security and restricted access to personal data</li>
              <li>Regular vulnerability and malware scans</li>
            </ul>
            <p>While we strive to protect your information, no online platform can guarantee absolute security.</p>
          </Section>

          <Section title="7. Third-Party Links">
            <p>Our Service may include links to third-party websites or services. We are not responsible for their content or privacy practices. We recommend reviewing their privacy policies before interacting or providing any information.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction (for example, under GDPR or CCPA), you may have the right to:</p>
            <ul>
              <li>Access, correct, or delete your personal information</li>
              <li>Withdraw consent at any time</li>
              <li>Request a copy of your data</li>
              <li>Lodge a complaint with a relevant data protection authority</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the details below.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Our Service is not directed toward children under the age of 13. We do not knowingly collect personal data from minors. If you believe a child has provided us personal information, please contact us so we can delete it.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="12. Google User Data and Gmail Access">
            <p>Dutaly integrates with Google Gmail through Google's OAuth authorization system.</p>

            <p className="font-semibold text-white">Google User Data Accessed</p>
            <p>When a user connects their Gmail account, Dutaly may access:</p>
            <ul>
              <li>Email message content</li>
              <li>Email conversation history</li>
              <li>Email metadata including sender, recipient, subject, timestamps, and labels</li>
              <li>Gmail labels and folder information</li>
            </ul>
            <p>This access is limited to the permissions granted by the user through Google's consent screen.</p>

            <p className="font-semibold text-white">Google User Data Usage</p>
            <p>Google user data is used solely to provide Dutaly's AI-powered customer support functionality, including:</p>
            <ul>
              <li>Reading incoming support emails</li>
              <li>Creating and managing support tickets</li>
              <li>Classifying customer requests</li>
              <li>Generating AI-powered draft responses</li>
              <li>Sending approved or automated replies on behalf of the user</li>
              <li>Maintaining conversation context for customer support interactions</li>
            </ul>
            <p>Google user data is not used for advertising, profiling, marketing, or sold to third parties.</p>

            <p className="font-semibold text-white">Google User Data Sharing</p>
            <p>Dutaly does not sell, rent, or share Google user data with advertisers or data brokers.</p>
            <p>Google user data may be processed by trusted service providers strictly for the purpose of operating the Service, including:</p>
            <ul>
              <li>Cloud hosting providers</li>
              <li>Database and infrastructure providers</li>
              <li>AI processing providers used to generate support responses</li>
            </ul>
            <p>These providers are contractually required to protect user information and may only process data necessary to provide the Service.</p>

            <p className="font-semibold text-white">Google User Data Storage and Protection</p>
            <p>Google user data is protected using industry-standard security measures including:</p>
            <ul>
              <li>Encrypted transmission using HTTPS/TLS</li>
              <li>Secure cloud-hosted infrastructure</li>
              <li>Access controls and authentication safeguards</li>
              <li>Restricted access to authorized personnel only</li>
              <li>Secure storage of OAuth credentials and access tokens</li>
            </ul>

            <p className="font-semibold text-white">Data Retention and Deletion</p>
            <p>Google user data is retained only for as long as necessary to provide the Service.</p>
            <p>Users may request deletion of their data by contacting Dutaly at <a href="mailto:prathamrajsinha@gmail.com" className="underline" style={{ color: "rgba(255,255,255,0.85)" }}>prathamrajsinha@gmail.com</a>.</p>
            <p>Upon account deletion or approved deletion request:</p>
            <ul>
              <li>Connected Gmail accounts are disconnected</li>
              <li>Stored OAuth tokens are revoked or removed</li>
              <li>Associated user data is permanently deleted within a reasonable period unless retention is required by law</li>
            </ul>
            <p>Users may also revoke Dutaly's access at any time through their Google Account security settings.</p>

            <p className="font-semibold text-white">Google API Services Disclosure</p>
            <p>Dutaly's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</p>
          </Section>

          <Section title="13. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact:</p>
            <ContactBlock />
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

function ContactBlock() {
  return (
    <div className="mt-2 p-5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="font-semibold text-white">Dutaly</p>
      <p>📧 prathamrajsinha@gmail.com</p>
      <p>📞 +91 9148253924</p>
      <p>📍 Bengaluru, Karnataka 560072, India</p>
    </div>
  );
}

export { ContactBlock };
