import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  customer_email: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  category: string | null;
  sentiment_score: number | null;
  escalation_flag: boolean;
  sla_due_at: string | null;
  last_customer_reply_at: string | null;
  thread_id: string | null;
  email_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useTickets(statusFilter?: TicketStatus) {
  const { user } = useAuth();
  const { selectedAccountId, connectedAccountIds, accountsLoading } = useSelectedAccount();

  const scopeIds =
    selectedAccountId === "all" ? connectedAccountIds : [selectedAccountId];

  return useQuery({
    queryKey: ["tickets", user?.id, statusFilter, selectedAccountId, scopeIds.join(",")],
    queryFn: async () => {
      if (scopeIds.length === 0) return [] as Ticket[];
      let query = supabase
        .from("tickets")
        .select("*")
        .in("email_account_id", scopeIds)
        .order("created_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!user && !accountsLoading,
  });
}
