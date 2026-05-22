import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";

export interface AutoSentEntry {
  id: string;
  customer_email: string;
  customer_name: string | null;
  subject: string;
  sent_at: string;
  confidence_score: number | null;
  suggested_reply: string | null;
  kb_entry_used: string | null;
  ticket_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
}

export function useAutoSentAudit() {
  const { user } = useAuth();
  const { selectedAccountId, connectedAccountIds, accountsLoading } = useSelectedAccount();

  const scopeIds =
    selectedAccountId === "all" ? connectedAccountIds : [selectedAccountId];

  return useQuery({
    queryKey: ["auto-sent-audit", user?.id, selectedAccountId, scopeIds.join(",")],
    queryFn: async () => {
      if (scopeIds.length === 0) return [] as AutoSentEntry[];
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("action", "auto_replied")
        .in("email_account_id", scopeIds)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((log: any) => ({
        id: log.id,
        customer_email: log.email_from || "Unknown",
        customer_name: log.email_from?.split("@")[0] || null,
        subject: log.email_subject || "No subject",
        sent_at: log.created_at,
        confidence_score: log.details?.confidence ?? null,
        suggested_reply: null,
        kb_entry_used: log.details?.kb_entry_title ?? null,
        ticket_id: log.details?.ticket_id ?? null,
        action: log.action,
        details: log.details,
      })) as AutoSentEntry[];
    },
    enabled: !!user && !accountsLoading,
  });
}
