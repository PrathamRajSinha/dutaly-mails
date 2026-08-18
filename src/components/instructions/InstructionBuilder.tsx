import { useState } from "react";
import { Plus, Trash2, Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useInstructionRules } from "@/hooks/useInstructionRules";

export function InstructionBuilder() {
  const { rules, addRule, updateRule, deleteRule, isLoading } = useInstructionRules();
  const [newRuleText, setNewRuleText] = useState("");
  const [newPriority, setNewPriority] = useState<string>("normal");
  const [error, setError] = useState<string | null>(null);

  // Flat list - filter out any legacy child rules
  const flatRules = rules
    .filter((r) => !r.parent_id)
    .sort((a, b) => {
      const w = (p: string) => (p === "critical" ? 0 : 1);
      return w(a.priority) - w(b.priority) || a.sort_order - b.sort_order;
    });

  const handleAddRule = () => {
    if (!newRuleText.trim()) {
      setError("Rule text cannot be empty");
      return;
    }
    if (newRuleText.trim().length < 5) {
      setError("Rule is too short (min 5 chars)");
      return;
    }
    
    setError(null);
    addRule.mutate({
      rule_text: newRuleText.trim(),
      priority: newPriority,
    });
    setNewRuleText("");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRuleText(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Add instruction form */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="e.g. Always mention our 30-day money-back guarantee"
              value={newRuleText}
              onChange={handleTextChange}
              className={cn(
                "pr-10",
                error ? "border-destructive focus-visible:ring-destructive" : "border-border"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddRule();
              }}
            />
            {error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
          </div>
          <Select value={newPriority} onValueChange={setNewPriority}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRule} disabled={addRule.isPending}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        <p className="text-[11px] text-[#9490B8]">
          <span className="font-medium text-primary">Pro tip:</span> Be specific. Instead of "Be nice", use "Always use a friendly tone and address the customer by their first name."
        </p>
      </div>

      {/* Rules list grouped by priority */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : flatRules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No instructions yet. Add your first rule above to guide the AI.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Critical Rules */}
          {flatRules.some(r => r.priority === 'critical') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#FCEBEB] text-[#A32D2D] border-none hover:bg-[#FCEBEB]">Critical</Badge>
                <span className="text-xs text-[#9490B8]">These rules take precedence over everything else.</span>
              </div>
              <div className="space-y-2">
                {flatRules.filter(r => r.priority === 'critical').map((rule) => (
                  <RuleItem key={rule.id} rule={rule} onUpdate={updateRule.mutate} onDelete={deleteRule.mutate} />
                ))}
              </div>
            </div>
          )}

          {/* Normal Rules */}
          {flatRules.some(r => r.priority !== 'critical') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#EBE9FF] text-[#534AB7] border-none hover:bg-[#EBE9FF]">Normal</Badge>
                <span className="text-xs text-[#9490B8]">Standard behavioral guidelines for the AI.</span>
              </div>
              <div className="space-y-2">
                {flatRules.filter(r => r.priority !== 'critical').map((rule) => (
                  <RuleItem key={rule.id} rule={rule} onUpdate={updateRule.mutate} onDelete={deleteRule.mutate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RuleItem({ rule, onUpdate, onDelete }: { rule: any, onUpdate: any, onDelete: any }) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl bg-white p-3 px-4 border transition-all duration-200",
        rule.is_active
          ? "border-border shadow-sm"
          : "border-border/50 bg-slate-50/50 opacity-60"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm text-[#3D3A5C]", !rule.is_active && "line-through text-[#9490B8]")}>
          {rule.rule_text}
        </p>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Switch
                checked={rule.is_active}
                onCheckedChange={(v) => onUpdate({ id: rule.id, is_active: v })}
                className="scale-75 data-[state=checked]:bg-emerald-500"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {rule.is_active ? "Disable rule" : "Enable rule"}
          </TooltipContent>
        </Tooltip>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#9490B8] hover:text-destructive hover:bg-destructive/5"
          onClick={() => onDelete(rule.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
