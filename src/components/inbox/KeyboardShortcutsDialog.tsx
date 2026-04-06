import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutEntry {
  key: string;
  description: string;
}

const shortcuts: ShortcutEntry[] = [
  { key: "j", description: "Next ticket / email" },
  { key: "k", description: "Previous ticket / email" },
  { key: "r", description: "Reply / Compose" },
  { key: "e", description: "Resolve ticket" },
  { key: "s", description: "Snooze email" },
  { key: "a", description: "Approve & send" },
  { key: "x", description: "Ignore email" },
  { key: "?", description: "Toggle this help" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 px-1">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
