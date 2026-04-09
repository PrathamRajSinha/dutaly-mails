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

interface Props {
  globalThreshold: number;
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function CategoryThresholds({ globalThreshold }: Props) {
  const { allCategories, upsertThreshold, deleteThreshold, isLoading } = useCategoryThresholds();

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
        {allCategories.map(({ category, threshold }) => {
          const value = threshold?.confidence_threshold ?? globalThreshold;
          const isOverridden = !!threshold;

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-[#3D3A5C]">{formatCategory(category)}</Label>
                  {isOverridden && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      Custom
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#7C6FE0] w-10 text-right">
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
