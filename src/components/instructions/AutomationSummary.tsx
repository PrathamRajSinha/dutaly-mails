import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationSummaryProps {
  autoReply: boolean;
  confidenceThreshold: number;
  backupEmail?: string | null;
  escalateUncertain: boolean;
}

export function AutomationSummary({
  autoReply,
  confidenceThreshold,
  backupEmail,
  escalateUncertain,
}: AutomationSummaryProps) {
  return (
    <Card className="border-none bg-primary/5 mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Zap className={cn("h-4 w-4", autoReply ? "text-amber-500" : "text-slate-400")} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#9490B8] uppercase tracking-wider">Status</p>
              <p className="text-sm font-semibold text-[#1A1730]">
                {autoReply ? "Auto-Send Active" : "Review Mode Only"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#9490B8] uppercase tracking-wider">Confidence</p>
              <p className="text-sm font-semibold text-[#1A1730]">
                {Math.round(confidenceThreshold * 100)}% Minimum
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#9490B8] uppercase tracking-wider">Escalation</p>
              <p className="text-sm font-semibold text-[#1A1730] truncate">
                {backupEmail || "Review Queue"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#9490B8] uppercase tracking-wider">Low Confidence</p>
              <p className="text-sm font-semibold text-[#1A1730]">
                {escalateUncertain ? "Always Escalate" : "Ignore"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
