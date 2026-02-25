import { useState } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
  GripVertical,
} from "lucide-react";
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
import {
  useInstructionRules,
  type InstructionRule,
} from "@/hooks/useInstructionRules";
import { Sparkles } from "lucide-react";

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  important: { label: "Important", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", dot: "bg-orange-500" },
  normal: { label: "Normal", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  low: { label: "Low", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

const conditionButtons = [
  { value: "if", label: "IF" },
  { value: "when", label: "WHEN" },
  { value: "unless", label: "UNLESS" },
  { value: "always", label: "ALWAYS" },
  { value: "never", label: "NEVER" },
] as const;

function RuleItem({
  rule,
  children,
  onUpdate,
  onDelete,
  onAddSub,
  depth = 0,
}: {
  rule: InstructionRule;
  children: InstructionRule[];
  onUpdate: (id: string, updates: Partial<InstructionRule>) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentId: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const config = priorityConfig[rule.priority];

  return (
    <div className={cn("space-y-1", depth > 0 && "ml-6 border-l-2 border-border pl-3")}>
      <div
        className={cn(
          "group flex items-start gap-2 rounded-lg border p-3 transition-colors",
          rule.is_active ? config.color : "bg-muted/50 text-muted-foreground border-border opacity-60"
        )}
      >
        <div className="flex items-center gap-1.5 pt-0.5">
          {children.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="p-0.5">
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
          <div className={cn("h-2 w-2 rounded-full shrink-0", config.dot)} />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {rule.condition_type && (
            <span className="inline-block rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mr-1">
              {rule.condition_type}
              {rule.condition_text && ` ${rule.condition_text} →`}
            </span>
          )}
          <p className={cn("text-sm", !rule.is_active && "line-through")}>{rule.rule_text}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Switch
            checked={rule.is_active}
            onCheckedChange={(v) => onUpdate(rule.id, { is_active: v })}
            className="scale-75"
          />
          {depth === 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-xs" onClick={() => onAddSub(rule.id)}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-destructive hover:text-destructive"
            onClick={() => onDelete(rule.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && children.map((child) => (
        <RuleItem
          key={child.id}
          rule={child}
          children={[]}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSub={onAddSub}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function InstructionBuilder() {
  const { topLevelRules, getChildren, addRule, updateRule, deleteRule, isLoading } = useInstructionRules();
  const [newRuleText, setNewRuleText] = useState("");
  const [newPriority, setNewPriority] = useState<string>("normal");
  const [newConditionType, setNewConditionType] = useState<string | null>(null);
  const [newConditionText, setNewConditionText] = useState("");
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [subRuleText, setSubRuleText] = useState("");
  const [subConditionType, setSubConditionType] = useState<string | null>(null);
  const [subConditionText, setSubConditionText] = useState("");

  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    addRule.mutate({
      rule_text: newRuleText.trim(),
      priority: newPriority,
      condition_type: newConditionType,
      condition_text: newConditionText.trim() || null,
    });
    setNewRuleText("");
    setNewConditionType(null);
    setNewConditionText("");
  };

  const handleAddSubRule = (parentId: string) => {
    if (!subRuleText.trim()) return;
    addRule.mutate({
      rule_text: subRuleText.trim(),
      parent_id: parentId,
      condition_type: subConditionType,
      condition_text: subConditionText.trim() || null,
    });
    setSubRuleText("");
    setSubConditionType(null);
    setSubConditionText("");
    setAddingSubFor(null);
  };

  const handleUpdate = (id: string, updates: Partial<InstructionRule>) => {
    updateRule.mutate({ id, ...updates });
  };

  const handleDelete = (id: string) => {
    deleteRule.mutate(id);
  };

  const groupedByPriority = {
    critical: topLevelRules.filter((r) => r.priority === "critical"),
    important: topLevelRules.filter((r) => r.priority === "important"),
    normal: topLevelRules.filter((r) => r.priority === "normal"),
    low: topLevelRules.filter((r) => r.priority === "low"),
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Instructions
        </CardTitle>
        <CardDescription>
          Define structured rules for how the AI handles emails. Add conditions, set priorities, and nest sub-instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add instruction form */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          {/* Condition buttons */}
          <div className="flex flex-wrap gap-1.5">
            {conditionButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={newConditionType === btn.value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => {
                  setNewConditionType(newConditionType === btn.value ? null : btn.value);
                }}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Condition text input */}
          {newConditionType && newConditionType !== "always" && newConditionType !== "never" && (
            <Input
              placeholder={`${newConditionType === "if" ? "e.g. customer mentions refund" : newConditionType === "when" ? "e.g. email is about billing" : "e.g. answer is in knowledge base"}...`}
              value={newConditionText}
              onChange={(e) => setNewConditionText(e.target.value)}
              className="text-sm"
            />
          )}

          <div className="flex gap-2">
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
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddRule} disabled={!newRuleText.trim() || addRule.isPending}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Rules list grouped by priority */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading rules...</p>
        ) : topLevelRules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No instructions yet. Add your first rule above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(["critical", "important", "normal", "low"] as const).map((priority) => {
              const group = groupedByPriority[priority];
              if (group.length === 0) return null;
              const cfg = priorityConfig[priority];
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cfg.label}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {group.length}
                    </Badge>
                  </div>
                  {group.map((rule) => (
                    <div key={rule.id}>
                      <RuleItem
                        rule={rule}
                        children={getChildren(rule.id)}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onAddSub={(parentId) => {
                          setAddingSubFor(parentId);
                          setSubRuleText("");
                          setSubConditionType(null);
                          setSubConditionText("");
                        }}
                      />
                      {addingSubFor === rule.id && (
                        <div className="ml-6 border-l-2 border-border pl-3 mt-1 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {conditionButtons.map((btn) => (
                              <Button
                                key={btn.value}
                                variant={subConditionType === btn.value ? "default" : "outline"}
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => setSubConditionType(subConditionType === btn.value ? null : btn.value)}
                              >
                                {btn.label}
                              </Button>
                            ))}
                          </div>
                          {subConditionType && subConditionType !== "always" && subConditionType !== "never" && (
                            <Input
                              placeholder="Condition..."
                              value={subConditionText}
                              onChange={(e) => setSubConditionText(e.target.value)}
                              className="text-sm h-8"
                            />
                          )}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Sub-instruction..."
                              value={subRuleText}
                              onChange={(e) => setSubRuleText(e.target.value)}
                              className="flex-1 h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddSubRule(rule.id);
                              }}
                              autoFocus
                            />
                            <Button size="sm" className="h-8" onClick={() => handleAddSubRule(rule.id)} disabled={!subRuleText.trim()}>
                              Add
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingSubFor(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
