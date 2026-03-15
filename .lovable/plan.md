

# Landing Page Repositioning: AI Helpdesk

Updating all landing page copy and adding new sections while preserving the existing design system, animations, and layout.

## Changes by File

### 1. `src/components/landing/HeroSection.tsx`
- Badge: "AI-Powered Email Assistant" → "AI-Powered Helpdesk"
- Headline: Replace 3-word animation with "AI Helpdesk Built for Growing Teams" (keep ShinyText on "Growing Teams")
- Subtitle: New helpdesk-focused copy
- Primary CTA: "Start Managing Support Smarter"
- Secondary CTA: "See How It Works"
- Add 3 benefit bullets below CTAs (animated, staggered)
- Update dashboard preview badges to show ticket-related labels ("Ticket Created", "SLA Tracked", "Escalated")

### 2. `src/components/landing/TrustedBySection.tsx` → **Problem Section**
- Currently returns `null`. Repurpose as the "Your Inbox Was Never Built for Customer Support" 3-column problem section
- Use existing spotlight card pattern from FeaturesSection for visual consistency
- Add subtext below columns

### 3. `src/components/landing/FeaturesSection.tsx` → **Solution Section**
- Section label: "Solution"
- Title: "Meet Your AI-Powered Customer Inbox"
- Description paragraph added
- Replace 6 feature cards with 4 new ones: AI Classification & Sentiment, Smart Reply Generation, SLA Tracking & Escalation, Slack & Webhook Integrations
- Keep the SpotlightCard component and all its mouse-tracking effects

### 4. `src/components/landing/InteractiveDemoSection.tsx` → **How It Works**
- Title: "From Email to Resolution — Automatically"
- Replace tab labels with 5 steps: "Email Received", "AI Classifies", "Draft Generated", "You Approve", "SLA Tracked"
- Update tab content for each step with helpdesk-focused content
- Keep all animation logic (typing effect, progress bar, auto-cycle)

### 5. `src/components/landing/StatsSection.tsx` → **Differentiation Section**
- Currently returns `null`. Build "Why Teams Choose MailReplAI" section
- Two-column comparison: Traditional Helpdesk vs MailReplAI
- Use motion animations consistent with the rest of the page

### 6. `src/components/landing/TestimonialsSection.tsx` → **Use Cases Section**
- Currently returns `null`. Build "Built for Modern Growing Teams" section
- 4 cards: SaaS Startups, D2C Brands, Agencies, Service Businesses
- Use SpotlightCard-style hover effects

### 7. `src/components/landing/PricingSection.tsx`
- Rename tiers: Starter, Growth (highlighted), Pro
- Reframe features around tickets, AI replies, SLA tracking, integrations
- Add note: "Designed for growing teams that want structure without enterprise pricing."
- Remove "email automation" language

### 8. `src/components/landing/CTASection.tsx`
- Headline: "Stop Managing Support in Gmail Alone"
- Subheadline: "Upgrade your inbox into an AI-powered helpdesk in minutes."
- Primary CTA: "Start Free Trial"
- Secondary CTA: "Book a Demo" (mailto link placeholder)

### 9. New section: **Trust & Security** (add between Pricing and CTA in `Landing.tsx`)
- Create `src/components/landing/SecuritySection.tsx`
- Title: "Enterprise-Grade Security, Built on Supabase"
- 4 items: Secure auth, Encrypted connections, Role-based access, Data isolation via RLS

### 10. `src/pages/Landing.tsx`
- Add SecuritySection import and place between PricingSection and CTASection

### 11. `src/components/landing/LandingNavbar.tsx`
- Update nav links: Features → "Features", Demo → "How It Works", Pricing → "Pricing", Testimonials → "Use Cases"

### 12. `src/components/landing/FooterSection.tsx`
- Update nav links to match new section names

## What Does NOT Change
- AntigravityDots, ShinyText, StarBorder, MagneticButton components
- All Framer Motion animations, gradient blobs, noise overlays
- Dark theme, Tailwind styling, responsive breakpoints
- SpotlightCard mouse-tracking hover effect (reused across sections)
- Overall page layout structure and section ordering

