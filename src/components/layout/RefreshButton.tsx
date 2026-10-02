import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  const refresh = async () => {
    setSpinning(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setTimeout(() => setSpinning(false), 400);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={refresh}
      disabled={spinning}
      title="Refresh to see latest changes (read receipts, statuses)"
      className="text-muted-foreground hover:text-foreground"
    >
      <RefreshCw className={cn("mr-1.5 h-4 w-4", spinning && "animate-spin")} />
      Refresh
    </Button>
  );
}
