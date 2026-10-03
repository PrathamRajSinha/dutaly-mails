import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { formatDistanceToNow, format, subHours, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  openedAt?: string | null;
  lastOpenedAt?: string | null;
  openCount?: number | null;
  emailId?: string;
  className?: string;
}

const SENT = ["sent", "approved", "edited"];

interface OpenEvent { id: string; client: string | null; is_proxy: boolean; country: string | null; created_at: string }

export function ReadReceiptBadge({ status, openedAt, lastOpenedAt, openCount, emailId, className }: Props) {
  const [open, setOpen] = useState(false);
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["open-events", emailId],
    enabled: open && !!emailId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("email_open_events")
        .select("id, client, is_proxy, country, created_at")
        .eq("email_queue_id", emailId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as OpenEvent[];
    },
  });

  if (!SENT.includes(status)) return null;
  const opened = !!openedAt;
  const count = openCount ?? (opened ? 1 : 0);
  const last24 = events.filter((e) => new Date(e.created_at) > subHours(new Date(), 24)).length;
  const last7 = events.filter((e) => new Date(e.created_at) > subDays(new Date(), 7)).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium",
            opened ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            className,
          )}
        >
          {opened ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {opened
            ? `Likely opened${count > 1 ? ` · ${count}×` : ""} · ${formatDistanceToNow(new Date(lastOpenedAt || openedAt!), { addSuffix: true })}`
            : "Unopened"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 text-xs" align="start" onClick={(e) => e.stopPropagation()}>
        {opened ? (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted p-2"><p className="text-base font-semibold text-foreground">{count}</p><p className="text-muted-foreground">Total opens</p></div>
              <div className="rounded-md bg-muted p-2"><p className="text-base font-semibold text-foreground">{last24}</p><p className="text-muted-foreground">Last 24h</p></div>
              <div className="rounded-md bg-muted p-2"><p className="text-base font-semibold text-foreground">{last7}</p><p className="text-muted-foreground">Last 7 days</p></div>
            </div>
            <p className="text-muted-foreground">First opened {format(new Date(openedAt!), "MMM d, h:mm a")}</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : events.length === 0 ? (
                <p className="text-muted-foreground">Detailed history is only recorded for opens from now on.</p>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b border-border py-1 last:border-0">
                    <span className="text-foreground">{format(new Date(e.created_at), "MMM d, h:mm a")}</span>
                    <span className="text-muted-foreground">
                      {e.client || "Unknown"}{e.is_proxy ? " (auto)" : ""}{e.country ? ` · ${e.country}` : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p>Not opened yet. Some mail apps block images, so opens may not always show.</p>
        )}
        <p className="border-t border-border pt-2 text-muted-foreground">
          Note: Apple Mail and Gmail can load images automatically, so opens are shown as "likely opened". "(auto)" marks opens that were probably triggered by the mail app, not a person.
        </p>
      </PopoverContent>
    </Popover>
  );
}
