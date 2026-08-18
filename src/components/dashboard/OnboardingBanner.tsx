import { Check, Circle, Loader2, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingBannerProps {
  hasEmailAccount: boolean;
  hasKbEntry: boolean;
  hasProcessedEmails: boolean;
  onFetchEmails: () => Promise<void>;
  isFetching: boolean;
  onDismiss: () => void;
}

export function OnboardingBanner({
  hasEmailAccount,
  hasKbEntry,
  hasProcessedEmails,
  onFetchEmails,
  isFetching,
  onDismiss,
}: OnboardingBannerProps) {
  const navigate = useNavigate();
  
  const steps = [
    { 
      label: "Connect your email", 
      done: hasEmailAccount, 
      link: "/settings", 
      description: "Connect your Gmail or IMAP account to start receiving emails." 
    },
    { 
      label: "Add knowledge base", 
      done: hasKbEntry, 
      link: "/knowledge-base", 
      description: "Help the AI understand your business by adding FAQs and docs." 
    },
    { 
      label: "Fetch your first emails", 
      done: hasProcessedEmails, 
      action: "fetch",
      description: "Trigger the first sync to see the AI in action." 
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const stepsLeft = steps.length - completedCount;

  // Determine which step is currently active (first one not done)
  const activeStepIndex = steps.findIndex(s => !s.done);
  
  const handleStepClick = (step: typeof steps[0], index: number) => {
    if (step.done) return;
    
    if (step.link) {
      navigate(step.link);
    } else if (step.action === "fetch") {
      if (hasEmailAccount) {
        onFetchEmails();
      }
    }
  };

  const isFetchDisabled = isFetching || !hasEmailAccount || hasProcessedEmails;
  const fetchTooltip = !hasEmailAccount ? "Connect an email account first" : isFetching ? "Syncing..." : hasProcessedEmails ? "Already synced" : "";

  return (
    <div
      className="mb-6 rounded-xl overflow-hidden border transition-all duration-300 shadow-sm"
      style={{
        backgroundColor: "#F9F8FF",
        borderColor: "rgba(124,111,224,0.2)",
      }}
      role="region"
      aria-label="Onboarding Progress"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2
              className="text-[17px] font-semibold"
              style={{ color: "#1A1730" }}
            >
              {stepsLeft > 0
                ? `Complete your setup (${completedCount}/${steps.length})`
                : "You're all set! 🎉"}
            </h2>
            <p className="text-[13px] mt-1" style={{ color: "#64748B" }}>
              {stepsLeft > 0 
                ? "Follow these steps to get your AI customer agent fully operational." 
                : "Everything is connected and running smoothly."}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-[12px] font-medium hover:text-[#7C6FE0] transition-colors"
            style={{ color: "#9490B8" }}
            aria-label="Dismiss onboarding"
          >
            Dismiss
          </button>
        </div>

        <div className="grid gap-3 mb-6">
          {steps.map((step, i) => {
            const isActive = i === activeStepIndex;
            const isClickable = !step.done;
            const isDisabledAction = step.action === 'fetch' && !hasEmailAccount;
            
            return (
              <button
                key={i}
                onClick={() => handleStepClick(step, i)}
                disabled={!isClickable || (step.action === 'fetch' && !hasEmailAccount)}
                className={cn(
                  "flex items-center text-left p-3 rounded-lg border transition-all duration-200 group w-full",
                  step.done ? "bg-white/50 border-transparent opacity-75" : 
                  isActive ? "bg-white border-[#7C6FE0]/30 shadow-sm" : "bg-white/50 border-transparent hover:border-[#7C6FE0]/20"
                )}
                aria-disabled={!isClickable}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex shrink-0">
                    {step.done ? (
                      <div className="bg-[#E1F5EE] rounded-full p-1">
                        <Check className="h-4 w-4" style={{ color: "#1D9E75" }} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className={cn(
                        "rounded-full p-1 border-2",
                        isActive ? "border-[#7C6FE0] bg-white" : "border-[#E2E8F0]"
                      )}>
                        <div className={cn("h-2.5 w-2.5 rounded-full", isActive ? "bg-[#7C6FE0]" : "bg-transparent")} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[14px] font-medium",
                        step.done ? "text-[#9490B8] line-through" : "text-[#1A1730]"
                      )}>
                        {step.label}
                      </span>
                      {step.action === 'fetch' && isDisabledAction && (
                        <span className="flex items-center gap-1 text-[11px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <AlertCircle className="h-3 w-3" />
                          Connect email first
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] mt-0.5 truncate" style={{ color: "#64748B" }}>
                      {step.description}
                    </p>
                  </div>

                  {step.action === 'fetch' && isActive && hasEmailAccount && (
                    <div className="ml-auto pr-2">
                      <Button
                        size="sm"
                        className="h-8 px-3 text-[12px] font-medium bg-[#7C6FE0] hover:bg-[#6D61D1]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFetchEmails();
                        }}
                        disabled={isFetching}
                      >
                        {isFetching ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Fetch now
                      </Button>
                    </div>
                  )}
                  
                  {isClickable && !step.action && (
                    <ChevronRight className={cn(
                      "h-4 w-4 ml-auto text-[#9490B8] transition-transform duration-200",
                      isActive && "group-hover:translate-x-0.5"
                    )} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-white/80">
          <div className="h-2 flex-1 rounded-full bg-[#EBE9FF]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-in-out"
              style={{
                width: `${(completedCount / steps.length) * 100}%`,
                backgroundColor: "#7C6FE0",
                boxShadow: "0 0 10px rgba(124,111,224,0.3)"
              }}
            />
          </div>
          <span className="text-[12px] font-semibold min-w-[3rem] text-right" style={{ color: "#7C6FE0" }}>
            {Math.round((completedCount / steps.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
