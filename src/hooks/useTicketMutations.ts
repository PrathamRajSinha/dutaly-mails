import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TicketStatus, TicketPriority } from "./useTickets";

export function useTicketMutations(ticketId: string | null) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  };

  const updateStatus = useMutation({
    mutationFn: async (status: TicketStatus) => {
      const { error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", ticketId!);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Status updated");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const updatePriority = useMutation({
    mutationFn: async (priority: TicketPriority) => {
      const { error } = await supabase
        .from("tickets")
        .update({ priority })
        .eq("id", ticketId!);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Priority updated");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  return { updateStatus, updatePriority };
}
