import { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useInstructionRules } from "@/hooks/useInstructionRules";

export function InstructionBuilder() {
  const { rules, addRule, updateRule, deleteRule, isLoading } = useInstructionRules();
  const [newRuleText, setNewRuleText] = useState("");
  const [newPriority, setNewPriority] = useState<string>("normal");

  // Flat list - filter out any legacy child rules
  const flatRules = rules
    .filter((r) => !r.parent_id)
    .sort((a, b) => {
      const w = (p: string) => (p === "critical" ? 0 : 1);
      return w(a.priority) - w(b.priority) || a.sort_order - b.sort_order;
    });

  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    addRule.mutate({
      rule_text: newRuleText.trim(),
      priority: newPriority,
    });
    setNewRuleText("");
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Instructions
        </CardTitle>
        <CardDescription>
          Define rules for how the AI handles emails. Critical rules always override Normal rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add instruction form */}
        <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-4">
          <Input
            placeholder="Type your instruction..."
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddRule();
            }}
          />
          <Select value={newPriority} onValueChange={setNewPriority}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRule} disabled={!newRuleText.trim() || addRule.isPending}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Rules list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading rules...</p>
        ) : flatRules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No instructions yet. Add your first rule above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flatRules.map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  "group flex items-center gap-3 rounded-[10px] bg-white p-3 px-4 transition-colors",
                  rule.is_active
                    ? "border border-[rgba(124,111,224,0.1)]"
                    : "border border-[rgba(124,111,224,0.06)] opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm text-[#3D3A5C]", !rule.is_active && "line-through")}>{rule.rule_text}</p>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 text-xs border-none rounded-full",
                    rule.priority === "critical"
                      ? "bg-[#FCEBEB] text-[#A32D2D]"
                      : "bg-[#EBE9FF] text-[#534AB7]"
                  )}
                >
                  {rule.priority === "critical" ? "Critical" : "Normal"}
                </Badge>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(v) => updateRule.mutate({ id: rule.id, is_active: v })}
                    className="scale-75"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-destructive hover:text-destructive"
                    onClick={() => deleteRule.mutate(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
