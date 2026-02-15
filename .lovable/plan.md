

# Usage Limits and Billing System (No Free Tier)

## Plan Structure

| | Starter | Pro | Enterprise |
|---|---|---|---|
| Price | TBD | TBD | Custom |
| Emails processed/month | 100 | 500 | Unlimited |
| AI questions/month | 20 | 100 | Unlimited |
| Knowledge base entries | 10 | 50 | Unlimited |
| Email accounts | 2 | 5 | Unlimited |
| Email templates | Yes | Yes | Yes |
| Priority support | No | Yes | Yes |
| Custom integrations | No | No | Yes |

All users must be on a paid plan to use the app. No free access.

## What Gets Built

### 1. Database tables (migration)

- **subscription_plans** -- stores the 3 plan tiers with their limits
- **user_subscriptions** -- tracks which plan each user is on, billing period, status
- **usage_tracking** -- monthly counters for emails processed and AI questions asked (resets each billing cycle)
- A database function `check_usage_limit(user_id, resource_type)` that returns whether a user can still use a resource
- Seed data: insert the 3 plans (Starter, Pro, Enterprise)
- Trigger on new user signup: auto-create a subscription record with status `pending` (no plan assigned yet -- forces them to pick one)

### 2. Frontend: Plan selection wall

- After signup, if a user has no active subscription, they see a "Choose Your Plan" page instead of the dashboard
- This page shows the 3 plans with their limits and a "Subscribe" button
- Since PhonePe integration comes later, the Subscribe button will show a "Contact us" or placeholder flow for now

### 3. Frontend: Usage tracking display

- New `useSubscription` hook -- fetches user's current plan and usage stats
- Usage indicators on the Dashboard (e.g., "45/100 emails this month")
- Warning toast when approaching 80% of any limit
- Block action with a clear "Upgrade your plan" message when limit is hit

### 4. Edge function enforcement

- `process-email` -- check email limit before processing, increment counter after success
- `ask-about-emails` -- check AI question limit before processing, increment counter after success
- Knowledge base -- check KB entry limit on the frontend before inserting

### 5. Landing page pricing update

- Update the PricingSection component to reflect the new 3-tier structure with actual limits (no free tier)
- Change tagline from "Start free. Scale as you grow." to something like "Choose the plan that fits your needs."

---

## Technical Details

### Database Migration SQL

**New tables:**

```text
subscription_plans
  - id (uuid, PK, default gen_random_uuid())
  - name (text, unique) -- 'starter', 'pro', 'enterprise'
  - display_name (text)
  - emails_per_month (integer, -1 = unlimited)
  - ai_questions_per_month (integer, -1 = unlimited)
  - kb_entries_limit (integer, -1 = unlimited)
  - email_accounts_limit (integer, -1 = unlimited)
  - price_monthly (numeric, default 0)
  - is_active (boolean, default true)
  - created_at (timestamptz, default now())

user_subscriptions
  - id (uuid, PK, default gen_random_uuid())
  - user_id (uuid, NOT NULL, unique)
  - plan_id (uuid, references subscription_plans)
  - status (text) -- 'active', 'pending', 'cancelled', 'expired'
  - current_period_start (timestamptz)
  - current_period_end (timestamptz)
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

usage_tracking
  - id (uuid, PK, default gen_random_uuid())
  - user_id (uuid, NOT NULL)
  - period_start (date, NOT NULL)
  - emails_processed (integer, default 0)
  - ai_questions_asked (integer, default 0)
  - created_at (timestamptz, default now())
  - UNIQUE(user_id, period_start)
```

**RLS policies:**
- subscription_plans: SELECT for all authenticated users (public catalog)
- user_subscriptions: users can only SELECT their own row; only service_role can INSERT/UPDATE
- usage_tracking: users can only SELECT their own row; only service_role can INSERT/UPDATE

**Seed data** (inserted in the same migration):
- Starter: 100 emails, 20 AI questions, 10 KB entries, 2 email accounts
- Pro: 500 emails, 100 AI questions, 50 KB entries, 5 email accounts
- Enterprise: -1 (unlimited) for all

**Trigger update:** Modify `handle_new_user()` to also insert a `user_subscriptions` row with status `pending` and no plan assigned.

### New Files

- `src/hooks/useSubscription.ts` -- fetches plan + usage data, exposes `canUse(resource)`, `usagePercent(resource)`
- `src/pages/ChoosePlan.tsx` -- plan selection page shown when subscription status is `pending`
- `src/components/dashboard/UsageCard.tsx` -- usage progress bars for the dashboard

### Modified Files

- `src/components/landing/PricingSection.tsx` -- update plans array with real limits and pricing
- `src/pages/Dashboard.tsx` -- add UsageCard component
- `src/components/ProtectedRoute.tsx` -- redirect to ChoosePlan if subscription is pending
- `src/App.tsx` -- add `/choose-plan` route
- `src/pages/KnowledgeBase.tsx` -- check KB entry limit before allowing creation
- `src/pages/Settings.tsx` -- check email account limit before allowing new connections
- `supabase/functions/process-email/index.ts` -- add usage check and increment
- `supabase/functions/ask-about-emails/index.ts` -- add usage check and increment
- `supabase/config.toml` -- no changes needed (edge functions already configured)

### Payment Integration (Phase 2, later)

PhonePe/Razorpay integration will be a separate phase requiring:
- A new edge function for creating payment orders
- A webhook edge function to handle payment confirmations
- Merchant account API keys as secrets
- Automatic plan activation on successful payment

