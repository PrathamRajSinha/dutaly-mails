import { useState } from "react";
import { Clock, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addHours, startOfTomorrow, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface SendLaterMenuProps {
  onSchedule: (sendAt: Date) => void;
  disabled?: boolean;
}

export function SendLaterMenu({ onSchedule, disabled }: SendLaterMenuProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("00");

  const presets = [
    { label: "In 2 hours", getDate: () => addHours(new Date(), 2) },
    { label: "Tomorrow at 9am", getDate: () => { const d = startOfTomorrow(); d.setHours(9, 0, 0, 0); return d; } },
    { label: "In 2 days", getDate: () => { const d = addDays(new Date(), 2); d.setHours(9, 0, 0, 0); return d; } },
  ];

  const handleCustomSchedule = () => {
    if (!date) return;
    const scheduled = new Date(date);
    scheduled.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onSchedule(scheduled);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Clock className="mr-1.5 h-3.5 w-3.5" /> Send Later
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground">Quick options</p>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { onSchedule(p.getDate()); setOpen(false); }}
              className="block w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Custom date & time</p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date()}
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="flex items-center gap-2">
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 24 }, (_, i) => (<SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}</SelectItem>))}</SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">:</span>
            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["00", "15", "30", "45"].map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
            </Select>
            <Button size="sm" className="h-8 text-xs ml-auto" onClick={handleCustomSchedule} disabled={!date}>Schedule</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
