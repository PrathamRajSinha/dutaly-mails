import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface InstructionRule {
  id: string;
  user_id: string;
  parent_id: string | null;
  rule_text: string;
  priority: string;
  condition_type: string | null;
  condition_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function compileRulesToPrompt(rules: InstructionRule[]): string {
  const active = rules.filter((r) => r.is_active && !r.parent_id);

  const critical = active.filter((r) => r.priority === "critical");
  const normal = active.filter((r) => r.priority !== "critical");

  const parts: string[] = [];
  if (critical.length > 0) {
    parts.push(`CRITICAL RULES (must always follow):\n${critical.map((r) => `- ${r.rule_text}`).join("\n")}`);
  }
  if (normal.length > 0) {
    parts.push(`STANDARD RULES:\n${normal.map((r) => `- ${r.rule_text}`).join("\n")}`);
  }

  return parts.join("\n\n") || "No instruction rules configured.";
}

export function useInstructionRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["instruction-rules", user?.id];

  const { data: rules = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_instruction_rules")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as InstructionRule[];
    },
    enabled: !!user,
  });

  const addRule = useMutation({
    mutationFn: async (rule: {
      rule_text: string;
      priority?: string;
      condition_type?: string | null;
      condition_text?: string | null;
      parent_id?: string | null;
    }) => {
      const maxSort = rules.reduce((max, r) => Math.max(max, r.sort_order), -1);
      const { data, error } = await supabase
        .from("ai_instruction_rules")
        .insert({
          user_id: user!.id,
          rule_text: rule.rule_text,
          priority: rule.priority || "normal",
          condition_type: null,
          condition_text: null,
          parent_id: null,
          sort_order: maxSort + 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e) => toast.error("Failed to add rule: " + e.message),
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstructionRule> & { id: string }) => {
      const { error } = await supabase
        .from("ai_instruction_rules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e) => toast.error("Failed to update: " + e.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_instruction_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e) => toast.error("Failed to delete: " + e.message),
  });

  return {
    rules,
    isLoading,
    addRule,
    updateRule,
    deleteRule,
  };
}
