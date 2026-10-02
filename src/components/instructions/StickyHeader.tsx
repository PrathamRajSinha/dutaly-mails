import React from "react";
import { Save, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function StickyHeader({ isDirty, isSaving, onSave, onDiscard }: StickyHeaderProps) {
  return (
    <div className="sticky top-0 z-50 mb-6 -mx-8 w-full border-b border-border/50 bg-background/90 px-8 py-4 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-foreground">AI Instructions</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className={cn(
               "h-2 w-2 rounded-full",
               isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
             )} />
              <p className="text-[13px] text-muted-foreground">
               {isDirty ? "Unsaved changes" : "All changes saved"}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isDirty && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDiscard}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Discard
            </Button>
          )}
          <Button 
            onClick={onSave} 
            disabled={!isDirty || isSaving}
            className="shadow-md shadow-primary/20"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
