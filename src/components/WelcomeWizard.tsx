import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  Sparkles,
  Settings as SettingsIcon,
  FileText,
  MessagesSquare,
  Sparkle,
} from "lucide-react";

const STORAGE_KEY = "dutaly-welcome-wizard-seen";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Sparkle,
    title: "Welcome to Dutaly",
    description:
      "Your AI-powered customer inbox. Dutaly reads incoming emails, drafts replies from your knowledge base, and sends them automatically when it's confident. Let's take a quick tour so you know where everything lives.",
  },
  {
    icon: SettingsIcon,
    title: "1. Connect your inbox",
    description:
      "Head to Settings to connect Gmail or any IMAP/SMTP account. You can connect multiple inboxes — each gets its own tab at the top of the app so you can switch between them.",
  },
  {
    icon: BookOpen,
    title: "2. Build your Knowledge Base",
    description:
      "Add articles, FAQs, or paste a URL on the Knowledge Base page. The AI strictly uses these sources to draft answers — no guessing. The richer your KB, the more emails get resolved automatically.",
  },
  {
    icon: Sparkles,
    title: "3. Set instructions & rules",
    description:
      "On the Instructions page, tell the AI how to behave — tone, do's & don'ts, category-specific confidence thresholds, and escalation rules for angry or sensitive emails.",
  },
  {
    icon: Inbox,
    title: "4. Review your Inbox",
    description:
      "The Inbox shows every email with its drafted reply. Approve, edit, or send. Replies the AI is unsure about wait here for you. Confident replies get sent automatically (with an unsend window).",
  },
  {
    icon: LayoutDashboard,
    title: "5. Track on the Dashboard",
    description:
      "The Dashboard shows your resolution rate, time saved, recent activity, and any knowledge gaps the AI has spotted. This is where you see Dutaly's impact at a glance.",
  },
  {
    icon: MessagesSquare,
    title: "Bonus: Ask & Templates",
    description:
      "Use Ask to query your past emails in natural language, and Templates to define reusable reply structures. You're all set — let's go!",
  },
];

export function WelcomeWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/dashboard" && !localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    setStep(0);
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : finish())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#EBE9FF" }}
          >
            <Icon className="h-6 w-6" style={{ color: "#7C6FE0" }} />
          </div>
          <DialogTitle className="text-[18px] font-medium" style={{ color: "#1A1730" }}>
            {current.title}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed" style={{ color: "#5C5880" }}>
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div className="my-2 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{
                backgroundColor: i <= step ? "#7C6FE0" : "rgba(124,111,224,0.2)",
              }}
            />
          ))}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={finish}
            className="text-[12px]"
            style={{ color: "#9490B8" }}
          >
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button
                size="sm"
                onClick={finish}
                style={{ backgroundColor: "#7C6FE0", color: "#fff" }}
              >
                Get started
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setStep(step + 1)}
                style={{ backgroundColor: "#7C6FE0", color: "#fff" }}
              >
                Next ({step + 1}/{steps.length})
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
