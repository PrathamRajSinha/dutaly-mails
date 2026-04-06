import { useEffect, useState, useCallback } from "react";

export interface ShortcutAction {
  key: string;
  label: string;
  description: string;
  action: () => void;
}

export function useInboxShortcuts(actions: ShortcutAction[]) {
  const [helpOpen, setHelpOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      for (const shortcut of actions) {
        if (e.key === shortcut.key) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [actions]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { helpOpen, setHelpOpen };
}
