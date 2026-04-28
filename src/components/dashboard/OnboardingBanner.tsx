import { Check, Circle, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const steps = [
    { label: "Connect your email", done: hasEmailAccount, link: "/settings" },
    { label: "Add your first knowledge base entry", done: hasKbEntry, link: "/knowledge-base" },
    { label: "Fetch your first emails", done: hasProcessedEmails, action: true },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const stepsLeft = steps.length - completedCount;

  return (
    <div
      className="mb-6 rounded-xl px-6 py-5"
      style={{
        backgroundColor: "#EBE9FF",
        border: "1px solid rgba(124,111,224,0.15)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2
            className="text-[15px] font-medium"
            style={{ color: "#1A1730" }}
          >
            {stepsLeft > 0
              ? `You're almost ready - ${stepsLeft} step${stepsLeft !== 1 ? "s" : ""} left`
              : "You're all set! 🎉"}
          </h2>

          <div className="mt-4 space-y-2.5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {step.done ? (
                  <Check
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#1D9E75" }}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Circle
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#7C6FE0" }}
                    strokeWidth={2}
                  />
                )}
                <span
                  className="text-[13px]"
                  style={{
                    color: step.done ? "#9490B8" : "#1A1730",
                    textDecoration: step.done ? "line-through" : "none",
                  }}
                >
                  {step.done ? (
                    step.label
                  ) : step.action ? (
                    <span className="inline-flex items-center gap-2">
                      {step.label}
                      <Button
                        size="sm"
                        className="ml-1 h-6 rounded-md px-2.5 text-[11px] font-medium"
                        style={{ backgroundColor: "#7C6FE0", color: "#fff" }}
                        onClick={onFetchEmails}
                        disabled={isFetching}
                      >
                        {isFetching ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-3 w-3" />
                        )}
                        Fetch now
                      </Button>
                    </span>
                  ) : (
                    <Link
                      to={step.link!}
                      className="underline decoration-[#7C6FE0]/40 underline-offset-2 hover:decoration-[#7C6FE0]"
                    >
                      {step.label}
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: "rgba(124,111,224,0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / steps.length) * 100}%`,
                  backgroundColor: "#7C6FE0",
                }}
              />
            </div>
            <span className="text-[11px] font-medium" style={{ color: "#7C6FE0" }}>
              {completedCount}/{steps.length}
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "#9490B8" }}>
            Once you fetch emails, Dutaly will start classifying and drafting replies automatically.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="ml-4 shrink-0 text-[12px] font-medium hover:underline"
          style={{ color: "#7C6FE0" }}
        >
          I'll explore on my own →
        </button>
      </div>
    </div>
  );
}
