import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  provider: "gmail" | "outlook";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmailAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ["email-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_accounts")
        .select("id, user_id, email_address, provider, is_active, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmailAccount[];
    },
    enabled: !!user,
  });

  const disconnectAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
      toast.success("Email account disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect: " + error.message);
    },
  });

  const toggleAccountStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("email_accounts")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
      toast.success(data.is_active ? "Account activated" : "Account paused");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  return {
    accounts,
    isLoading,
    error,
    disconnectAccount,
    toggleAccountStatus,
    hasConnectedAccount: accounts.length > 0,
  };
}
