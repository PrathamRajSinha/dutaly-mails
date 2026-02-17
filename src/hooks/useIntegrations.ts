import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  config_json: Record<string, any> | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useIntegrations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["integrations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Integration[];
    },
    enabled: !!user,
  });

  const addIntegration = useMutation({
    mutationFn: async (params: { provider: string; config_json: Record<string, any> }) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.from("integrations").insert({
        user_id: currentUser.id,
        provider: params.provider,
        config_json: params.config_json,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration added");
    },
    onError: () => toast.error("Failed to add integration"),
  });

  const updateIntegration = useMutation({
    mutationFn: async (params: { id: string; config_json?: Record<string, any>; is_active?: boolean }) => {
      const update: any = {};
      if (params.config_json !== undefined) update.config_json = params.config_json;
      if (params.is_active !== undefined) update.is_active = params.is_active;

      const { error } = await supabase
        .from("integrations")
        .update(update)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration updated");
    },
    onError: () => toast.error("Failed to update integration"),
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("integrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration removed");
    },
    onError: () => toast.error("Failed to remove integration"),
  });

  return { ...query, addIntegration, updateIntegration, deleteIntegration };
}
