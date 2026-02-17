import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface SlaSettings {
  sla_first_response_hours: number;
  sla_resolution_hours: number;
}

export function useSlaSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["sla-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_instructions")
        .select("sla_first_response_hours, sla_resolution_hours")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as SlaSettings;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: SlaSettings) => {
      const { error } = await supabase
        .from("ai_instructions")
        .update(settings)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-settings"] });
      toast.success("SLA settings saved");
    },
    onError: () => {
      toast.error("Failed to save SLA settings");
    },
  });

  return { data: query.data, isLoading: query.isLoading, update: updateMutation };
}
