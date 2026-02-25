import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface InstructionRule {
  id: string;
  user_id: string;
  parent_id: string | null;
  rule_text: string;
  priority: "critical" | "important" | "normal" | "low";
  condition_type: "if" | "when" | "unless" | "always" | "never" | null;
  condition_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const priorityWeight: Record<string, number> = {
  critical: 0,
  important: 1,
  normal: 2,
  low: 3,
};

export function compileRulesToPrompt(rules: InstructionRule[]): string {
  const active = rules.filter((r) => r.is_active);
  const topLevel = active
    .filter((r) => !r.parent_id)
    .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority] || a.sort_order - b.sort_order);

  const sections: Record<string, string[]> = {
    critical: [],
    important: [],
    normal: [],
    low: [],
  };

  for (const rule of topLevel) {
    const condPrefix = rule.condition_type
      ? `${rule.condition_type.toUpperCase()} ${rule.condition_text || ""} → `.trim() + " "
      : "";
    let line = `- ${condPrefix}${rule.rule_text}`;

    const children = active
      .filter((r) => r.parent_id === rule.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    for (const child of children) {
      const childCond = child.condition_type
        ? `${child.condition_type.toUpperCase()} ${child.condition_text || ""} → `.trim() + " "
        : "";
      line += `\n  - ${childCond}${child.rule_text}`;
    }

    sections[rule.priority].push(line);
  }

  const parts: string[] = [];
  if (sections.critical.length > 0) {
    parts.push(`CRITICAL RULES (must always follow):\n${sections.critical.join("\n")}`);
  }
  if (sections.important.length > 0) {
    parts.push(`IMPORTANT RULES:\n${sections.important.join("\n")}`);
  }
  if (sections.normal.length > 0) {
    parts.push(`STANDARD RULES:\n${sections.normal.join("\n")}`);
  }
  if (sections.low.length > 0) {
    parts.push(`LOW PRIORITY:\n${sections.low.join("\n")}`);
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
      const maxSort = rules.filter((r) => r.parent_id === (rule.parent_id || null))
        .reduce((max, r) => Math.max(max, r.sort_order), -1);
      const { data, error } = await supabase
        .from("ai_instruction_rules")
        .insert({
          user_id: user!.id,
          rule_text: rule.rule_text,
          priority: rule.priority || "normal",
          condition_type: rule.condition_type || null,
          condition_text: rule.condition_text || null,
          parent_id: rule.parent_id || null,
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
    topLevelRules: rules.filter((r) => !r.parent_id)
      .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority] || a.sort_order - b.sort_order),
    getChildren: (parentId: string) =>
      rules.filter((r) => r.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order),
  };
}
