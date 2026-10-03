import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useCategoryThresholds } from "@/hooks/useCategoryThresholds";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PRESETS: Record<string, { label: string; values: Record<string, number> }> = {
  ecommerce: { label: "E-commerce", values: { billing: 0.85, shipping: 0.75, returns: 0.85, general: 0.75, technical_issue: 0.85, feature_request: 0.8, complaint: 0.95, refund: 0.95 } },
  saas: { label: "SaaS / Software", values: { billing: 0.9, shipping: 0.8, returns: 0.85, general: 0.75, technical_issue: 0.8, feature_request: 0.75, complaint: 0.95, refund: 0.95 } },
  services: { label: "Services / Agency", values: { billing: 0.9, shipping: 0.8, returns: 0.85, general: 0.8, technical_issue: 0.85, feature_request: 0.8, complaint: 0.95, refund: 0.95 } },
  hr: { label: "HR / Recruiting", values: { billing: 0.95, shipping: 0.9, returns: 0.9, general: 0.85, technical_issue: 0.9, feature_request: 0.85, complaint: 0.98, refund: 0.98 } },
  support: { label: "General support", values: { billing: 0.85, shipping: 0.8, returns: 0.85, general: 0.75, technical_issue: 0.85, feature_request: 0.8, complaint: 0.95, refund: 0.9 } },
};

interface Props {
  globalThreshold: number;
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function CategoryThresholds({ globalThreshold }: Props) {
  const { allCategories, upsertThreshold, deleteThreshold, isLoading, thresholds } = useCategoryThresholds();
  const [industry, setIndustry] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const applyPreset = async () => {
    const preset = PRESETS[industry];
    if (!preset) return;
    setApplying(true);
    try {
      await Promise.all(Object.entries(preset.values).map(([category, confidence_threshold]) => upsertThreshold.mutateAsync({ category, confidence_threshold })));
      toast.success(`Applied recommended thresholds for ${preset.label}. You can still adjust each one.`);
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Category Thresholds
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Higher threshold = fewer auto-replies, more escalations. Lower = more auto-replies, higher risk.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          Override the global confidence threshold ({Math.round(globalThreshold * 100)}%) per email category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium text-foreground">
            {thresholds.length === 0 ? "Not sure where to start? What industry are you in?" : "Start from an industry preset"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Choose industry" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRESETS).map(([k, p]) => <SelectItem key={k} value={k}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9" disabled={!industry || applying} onClick={applyPreset}>Apply recommended</Button>
          </div>
          <p className="text-xs text-muted-foreground">Tip: use 95%+ for sensitive topics like refunds, complaints or legal issues so they're reviewed by you first.</p>
        </div>
        {allCategories.map(({ category, threshold }) => {
          const value = threshold?.confidence_threshold ?? globalThreshold;
          const isOverridden = !!threshold;

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-foreground">{formatCategory(category)}</Label>
                  {isOverridden && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      Custom
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary w-10 text-right">
                    {Math.round(value * 100)}%
                  </span>
                  {isOverridden && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteThreshold.mutate(threshold!.id)}
                      title="Reset to global"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => {
                  upsertThreshold.mutate({ category, confidence_threshold: v });
                }}
                min={0.5}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
