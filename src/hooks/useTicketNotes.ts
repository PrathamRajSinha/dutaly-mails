import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useTicketNotes(ticketId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addNote = useMutation({
    mutationFn: async (noteText: string) => {
      const { error } = await supabase
        .from("ticket_internal_notes")
        .insert({ ticket_id: ticketId!, user_id: user!.id, note_text: noteText });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-notes", ticketId] });
      toast.success("Note added");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("ticket_internal_notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-notes", ticketId] });
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  return { addNote, deleteNote };
}
