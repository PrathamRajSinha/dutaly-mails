import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  emails_per_month: number;
  ai_questions_per_month: number;
  kb_entries_limit: number;
  email_accounts_limit: number;
  price_monthly: number;
  resolutions_limit: number;
  overage_rate_per_resolution: number;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface BillingSubscription {
  id: string;
  plan: string;
  status: string | null;
  trial_start: string | null;
  trial_end: string | null;
}

interface UsageTracking {
  emails_processed: number;
  ai_questions_asked: number;
  resolutions_used: number;
}

export function useSubscription() {
  const { user } = useAuth();

  const planAliases: Record<string, string[]> = {
    starter: ["starter"],
    growth: ["growth", "pro"],
    scale: ["scale", "enterprise"],
  };

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    enabled: !!user,
  });

  const { data: usage } = useQuery({
    queryKey: ["usage-tracking", user?.id],
    queryFn: async () => {
      const periodStart = new Date();
      periodStart.setDate(1);
      const dateStr = periodStart.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("usage_tracking")
        .select("emails_processed, ai_questions_asked, resolutions_used")
        .eq("user_id", user!.id)
        .eq("period_start", dateStr)
        .maybeSingle();
      if (error) throw error;
      return (data as UsageTracking) || { emails_processed: 0, ai_questions_asked: 0, resolutions_used: 0 };
    },
    enabled: !!user,
  });

  const { data: billingSubscription, isLoading: billingLoading } = useQuery({
    queryKey: ["billing-subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, plan, status, trial_start, trial_end")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as BillingSubscription | null;
    },
    enabled: !!user,
  });

  const currentPlan =
    plans?.find((p) => p.id === subscription?.plan_id) ||
    plans?.find((p) => {
      const aliases = billingSubscription?.plan ? planAliases[billingSubscription.plan] || [billingSubscription.plan] : [];
      return aliases.includes(p.name);
    }) ||
    null;

  const hasManagedSubscription = subscription?.status === "active" && !!subscription?.plan_id;
  const hasLegacyBillingAccess = ["trialing", "active"].includes(billingSubscription?.status || "");
  const isPending = !hasManagedSubscription && !hasLegacyBillingAccess;
  const isActive = hasManagedSubscription || hasLegacyBillingAccess;

  const usagePercent = (resource: "emails" | "ai_questions" | "resolutions") => {
    if (!currentPlan || !usage) return 0;
    const limitMap: Record<string, number> = {
      emails: currentPlan.emails_per_month,
      ai_questions: currentPlan.ai_questions_per_month,
      resolutions: currentPlan.resolutions_limit ?? -1,
    };
    const usedMap: Record<string, number> = {
      emails: usage.emails_processed,
      ai_questions: usage.ai_questions_asked,
      resolutions: usage.resolutions_used ?? 0,
    };
    const limit = limitMap[resource];
    if (limit === -1) return 0;
    const used = usedMap[resource];
    return Math.round((used / limit) * 100);
  };

  const canUse = (resource: "emails" | "ai_questions" | "kb_entries" | "email_accounts") => {
    if (!currentPlan || !isActive) return false;
    const limitMap: Record<string, number> = {
      emails: currentPlan.emails_per_month,
      ai_questions: currentPlan.ai_questions_per_month,
      kb_entries: currentPlan.kb_entries_limit,
      email_accounts: currentPlan.email_accounts_limit,
    };
    const limit = limitMap[resource];
    if (limit === -1) return true;
    if (resource === "emails") return (usage?.emails_processed || 0) < limit;
    if (resource === "ai_questions") return (usage?.ai_questions_asked || 0) < limit;
    return true;
  };

  return {
    subscription,
    currentPlan,
    plans: plans || [],
    usage: usage || { emails_processed: 0, ai_questions_asked: 0, resolutions_used: 0 },
    isPending,
    isActive,
    isLoading: subLoading || billingLoading,
    usagePercent,
    canUse,
  };
}
