import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TONES = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-accent text-accent-foreground border-border",
  "bg-secondary text-secondary-foreground border-border",
  "bg-muted text-foreground border-border",
  "bg-destructive/10 text-destructive border-destructive/20",
];

export function labelTone(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export function LabelChip({ label, onRemove, onClick, active }: { label: string; onRemove?: () => void; onClick?: () => void; active?: boolean }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10px] font-medium whitespace-nowrap",
        labelTone(label),
        onClick && "cursor-pointer",
        active && "ring-2 ring-primary ring-offset-1 ring-offset-background",
      )}
    >
      {label}
      {onRemove && (
        <button type="button" aria-label={`Remove ${label}`} onClick={(e) => { e.stopPropagation(); onRemove(); }} className="rounded-full opacity-60 hover:opacity-100">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

interface LabelChipsProps {
  labels: string[] | null | undefined;
  table: "email_queue" | "tickets";
  id: string;
  editable?: boolean;
  suggestions?: string[];
}

export function LabelChips({ labels, table, id, editable = false, suggestions = [] }: LabelChipsProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const current = labels ?? [];

  const save = async (next: string[]) => {
    const { error } = await supabase.from(table).update({ labels: next }).eq("id", id);
    if (error) {
      toast.error("Couldn't update the labels. Please try again.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: [table === "tickets" ? "tickets" : "email-queue"] });
  };

  const add = (raw: string) => {
    const t = raw.trim().replace(/\s+/g, " ").slice(0, 32);
    if (!t) return;
    const label = t.charAt(0).toUpperCase() + t.slice(1);
    if (current.some((c) => c.toLowerCase() === label.toLowerCase())) return;
    save([...current, label]);
    setValue("");
  };

  if (!editable && current.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1" onClick={(e) => editable && e.stopPropagation()}>
      {current.map((l) => (
        <LabelChip key={l} label={l} onRemove={editable ? () => save(current.filter((c) => c !== l)) : undefined} />
      ))}
      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="inline-flex h-5 items-center gap-1 rounded-full border border-dashed border-border px-2 text-[10px] text-muted-foreground hover:text-foreground">
              <Plus className="h-2.5 w-2.5" /> Label
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <form onSubmit={(e) => { e.preventDefault(); add(value); }}>
              <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add a label…" className="h-8 text-xs" />
            </form>
            {suggestions.filter((s) => !current.includes(s)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.filter((s) => !current.includes(s)).slice(0, 12).map((s) => (
                  <LabelChip key={s} label={s} onClick={() => add(s)} />
                ))}
              </div>
            )}
            <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><Tag className="h-2.5 w-2.5" /> Press Enter to add</p>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
