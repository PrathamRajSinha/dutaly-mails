import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket } from "./useTickets";
import type { QueuedEmail } from "./useEmailQueue";

export interface TicketNote {
  id: string;
  ticket_id: string;
  user_id: string;
  note_text: string;
  created_at: string;
}

export function useTicketDetail(ticketId: string | null) {
  const { user } = useAuth();

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId!)
        .single();
      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!user && !!ticketId,
  });

  const emailsQuery = useQuery({
    queryKey: ["ticket-emails", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_queue")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("queued_at", { ascending: true });
      if (error) throw error;
      return data as QueuedEmail[];
    },
    enabled: !!user && !!ticketId,
  });

  const notesQuery = useQuery({
    queryKey: ["ticket-notes", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_internal_notes")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TicketNote[];
    },
    enabled: !!user && !!ticketId,
  });

  return {
    ticket: ticketQuery.data,
    emails: emailsQuery.data ?? [],
    notes: notesQuery.data ?? [],
    isLoading: ticketQuery.isLoading || emailsQuery.isLoading || notesQuery.isLoading,
  };
}
