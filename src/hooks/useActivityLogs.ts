import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
import type { Json } from "@/integrations/supabase/types";

export interface ActivityLog {
  id: string;
  user_id: string;
  email_account_id: string | null;
  action: string;
  email_subject: string | null;
  email_from: string | null;
  details: Json;
  created_at: string;
}

export function useActivityLogs(limit = 10) {
  const { user } = useAuth();
  const { selectedAccountId } = useSelectedAccount();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["activity-logs", user?.id, limit, selectedAccountId],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (selectedAccountId !== "all") {
        query = query.eq("email_account_id", selectedAccountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });

  const createLog = useMutation({
    mutationFn: async (log: Omit<ActivityLog, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("activity_logs")
        .insert([{
          action: log.action,
          email_account_id: log.email_account_id,
          email_subject: log.email_subject,
          email_from: log.email_from,
          details: log.details,
          user_id: user!.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    createLog,
  };
}