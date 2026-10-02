import { Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  openedAt?: string | null;
  lastOpenedAt?: string | null;
  openCount?: number | null;
  className?: string;
}

const SENT = ["sent", "approved", "edited"];

export function ReadReceiptBadge({ status, openedAt, lastOpenedAt, openCount, className }: Props) {
  if (!SENT.includes(status)) return null;
  const opened = !!openedAt;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium",
            opened ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            className,
          )}
        >
          {opened ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {opened ? `Opened ${formatDistanceToNow(new Date(lastOpenedAt || openedAt!), { addSuffix: true })}` : "Unopened"}
        </span>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {opened ? (
          <div className="space-y-0.5">
            <p>First opened {format(new Date(openedAt!), "MMM d, h:mm a")}</p>
            <p>Opened {openCount ?? 1} time{(openCount ?? 1) === 1 ? "" : "s"}</p>
          </div>
        ) : (
          <p>Not opened yet. Some mail apps block images, so opens may not always show.</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
