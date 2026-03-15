import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface KbGapEvent {
  id: string;
  user_id: string;
  ticket_id: string | null;
  detected_topic: string;
  category: string | null;
  resolved: boolean;
  created_at: string;
}

export interface GroupedGap {
  detected_topic: string;
  category: string | null;
  count: number;
  ids: string[];
}

export function useKbGaps() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: gaps = [], isLoading } = useQuery({
    queryKey: ["kb-gaps", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kb_gap_events")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as KbGapEvent[];
    },
    enabled: !!user,
  });

  // Group by topic
  const grouped: GroupedGap[] = [];
  const topicMap = new Map<string, GroupedGap>();
  for (const gap of gaps) {
    const key = gap.detected_topic.toLowerCase().trim();
    if (topicMap.has(key)) {
      const g = topicMap.get(key)!;
      g.count++;
      g.ids.push(gap.id);
    } else {
      const g: GroupedGap = {
        detected_topic: gap.detected_topic,
        category: gap.category,
        count: 1,
        ids: [gap.id],
      };
      topicMap.set(key, g);
      grouped.push(g);
    }
  }
  grouped.sort((a, b) => b.count - a.count);

  const resolveGaps = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("kb_gap_events")
        .update({ resolved: true })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb-gaps"] });
      toast.success("Gap resolved");
    },
  });

  return { gaps, grouped, isLoading, resolveGaps, totalGaps: gaps.length };
}
