import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CategoryThreshold {
  id: string;
  user_id: string;
  category: string;
  confidence_threshold: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_CATEGORIES = [
  "billing",
  "shipping",
  "returns",
  "general",
  "technical_issue",
  "feature_request",
  "complaint",
  "refund",
];

export function useCategoryThresholds() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["category-thresholds", user?.id];

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_thresholds")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as CategoryThreshold[];
    },
    enabled: !!user,
  });

  const upsertThreshold = useMutation({
    mutationFn: async ({ category, confidence_threshold }: { category: string; confidence_threshold: number }) => {
      const { error } = await supabase
        .from("category_thresholds")
        .upsert(
          {
            user_id: user!.id,
            category,
            confidence_threshold,
          },
          { onConflict: "user_id,category" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e) => toast.error("Failed to save threshold: " + e.message),
  });

  const deleteThreshold = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("category_thresholds")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Reset to global threshold");
    },
    onError: (e) => toast.error("Failed to delete: " + e.message),
  });

  // Merge with defaults to show all categories
  const allCategories = DEFAULT_CATEGORIES.map((cat) => {
    const existing = thresholds.find((t) => t.category === cat);
    return {
      category: cat,
      threshold: existing || null,
    };
  });

  // Include any custom categories from thresholds not in defaults
  thresholds.forEach((t) => {
    if (!DEFAULT_CATEGORIES.includes(t.category)) {
      allCategories.push({ category: t.category, threshold: t });
    }
  });

  return {
    thresholds,
    allCategories,
    isLoading,
    upsertThreshold,
    deleteThreshold,
  };
}
