import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addHours, addDays, startOfTomorrow, startOfDay, addWeeks } from "date-fns";

interface SnoozeMenuProps {
  onSnooze: (until: Date) => void;
  disabled?: boolean;
}

export function SnoozeMenu({ onSnooze, disabled }: SnoozeMenuProps) {
  const options = [
    { label: "1 hour", getDate: () => addHours(new Date(), 1) },
    { label: "3 hours", getDate: () => addHours(new Date(), 3) },
    { label: "Tomorrow morning", getDate: () => { const d = startOfTomorrow(); d.setHours(9, 0, 0, 0); return d; } },
    { label: "Next week", getDate: () => { const d = addWeeks(startOfDay(new Date()), 1); d.setHours(9, 0, 0, 0); return d; } },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Clock className="mr-1.5 h-3.5 w-3.5" /> Snooze
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.label} onClick={() => onSnooze(opt.getDate())}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
