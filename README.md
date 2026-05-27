# Dutaly — AI-Powered Customer Support Inbox

> *Duta* (दूत) means **messenger** in Sanskrit. Dutaly is your AI messenger — it reads, understands, and replies to customer emails so your team can focus on the hard stuff.

**Live demo:** https://dutaly.com
**Preview:** https://mail-replai.lovable.app

---

## The Problem

Small teams drown in repetitive customer support email. 80% of incoming tickets are variations of the same 20 questions — refunds, shipping status, password resets, "how do I…" — answers that already exist in a help doc somewhere. Hiring more agents is expensive, and generic chatbots hallucinate or stall in a "let me connect you to a human" loop.

## The Solution

Dutaly connects to your Gmail or IMAP inbox and uses your own **Knowledge Base** (URLs, PDFs, Word docs, presentations, images) as the *only* source of truth for AI-generated replies. Drafts are produced in seconds; confident replies can be auto-sent with a configurable unsend window; uncertain ones land in a review queue. Angry customers are automatically detected and escalated.

The result: a measurable **Resolution Rate** that goes up as your KB gets better — and a built-in **KB Gap Detection** loop that tells you exactly which questions you haven't documented yet.

---

## Key Features

- **AI replies grounded in your KB** — strict retrieval, no hallucinations. If the KB doesn't have the answer, the email is flagged, not guessed.
- **Multi-source Knowledge Base** — ingest URLs (auto-crawled), PDFs, Word docs, PowerPoint, and images via Gemini OCR.
- **Auto-reply with safety rails** — per-category confidence thresholds, global automation toggle, approval-only mode, and a 30s–2min unsend window on every auto-sent reply.
- **Sentiment-based escalation** — emails with sentiment < 0.3 (angry/at-risk) auto-escalate to a backup email and pause AI replies on that thread.
- **Ticketing built in** — threads auto-link to tickets, reopen on reply, with SLA enforcement and breach detection.
- **Instruction Builder** — write DO / DON'T rules with priorities to steer tone, refund policy, language, etc.
- **KB Gap Detection** — identifies unresolved topics and prompts you to fill them in. The retention flywheel.
- **Integrations** — Slack and webhook routing on events (new ticket, escalation, SLA breach).
- **Productivity** — snooze, send later, keyboard shortcuts, audit log of every auto-sent reply.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Supabase (Postgres + Auth + RLS), Edge Functions (Deno) |
| AI | Lovable AI Gateway (Gemini for OCR + reply generation) |
| Email | Gmail OAuth2, standard IMAP/SMTP (custom byte-count literal parser) |
| Payments | Razorpay subscriptions |
| Hosting | Lovable (Vercel-class edge) |

## Architecture

```text
┌────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Gmail /   │───▶│  Edge Functions  │───▶│   Postgres      │
│   IMAP     │    │  fetch-*-emails  │    │   + RLS         │
└────────────┘    └────────┬─────────┘    └────────┬────────┘
                           │                       │
                           ▼                       ▼
                  ┌──────────────────┐    ┌─────────────────┐
                  │  process-email   │───▶│  Knowledge Base │
                  │  (intent, cat,   │    │  (URLs/PDFs/    │
                  │   sentiment)     │    │   Docs via OCR) │
                  └────────┬─────────┘    └─────────────────┘
                           │
                           ▼
                  ┌──────────────────┐    ┌─────────────────┐
                  │  generate-reply  │───▶│  React Inbox UI │
                  │  (KB-grounded)   │    │  /mails         │
                  └──────────────────┘    └─────────────────┘
```

All write paths go through edge functions using the service role; the browser only talks to RLS-protected tables with the publishable anon key.

## Local Setup

```sh
git clone <repo-url>
cd dutaly
npm install
cp .env.example .env   # fill in your own Supabase + Razorpay publishable keys
npm run dev
```

Backend secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `GOOGLE_CLIENT_SECRET`, `LOVABLE_API_KEY`, etc.) live in Supabase Edge Function secrets — they are **never** committed to this repo.

## A Note on Public Keys in This Repo

The values in `src/integrations/supabase/client.ts` and the `.env.example` are the Supabase **anon/publishable key** and the Razorpay **publishable key ID** (`rzp_live_...`). These are designed to be public — they ship in the browser bundle anyway. Real secrets (service role, OAuth client secrets, AI gateway keys) live server-side in Supabase Edge Function secrets. Row-Level Security policies protect all user data.

## License

Built for a hackathon. All rights reserved by the authors.
