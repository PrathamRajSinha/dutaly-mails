import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, Sliders, Rocket, Loader2, Trash2, Edit2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface DraftKBEntry {
  title: string;
  content: string;
  category: string;
}

const steps = [
  { label: "Inbox Connected", icon: Check },
  { label: "Knowledge Base", icon: Globe },
  { label: "Confidence", icon: Sliders },
  { label: "Done", icon: Rocket },
];

function getConfidenceExplanation(value: number): { text: string; color: string } {
  if (value >= 0.85) {
    return {
      text: "Your AI will only auto-reply when extremely confident. Expect ~30% auto-resolution. Safest setting.",
      color: "text-green-600",
    };
  }
  if (value >= 0.7) {
    return {
      text: "Balanced. Your AI will auto-reply to most routine emails. Expect ~60% auto-resolution.",
      color: "text-primary",
    };
  }
  return {
    text: "Aggressive. Your AI will attempt most replies. Review your audit log regularly.",
    color: "text-amber-600",
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftEntries, setDraftEntries] = useState<DraftKBEntry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0.75);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateKB = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-kb-from-url", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.entries && Array.isArray(data.entries)) {
        setDraftEntries(data.entries);
        toast.success(`Generated ${data.entries.length} knowledge base entries`);
      } else {
        toast.error("No entries generated. Try a different URL.");
      }
    } catch (error) {
      console.error("KB generation error:", error);
      toast.error("Failed to generate entries. Try a different URL.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveKBEntries = async () => {
    if (!user || draftEntries.length === 0) return;
    setIsSaving(true);
    try {
      const validCategories = ["faq", "snippet", "document", "policy"];
      const entries = draftEntries.map((e) => ({
        user_id: user.id,
        title: e.title,
        content: e.content,
        category: validCategories.includes(e.category) ? e.category : "faq",
      }));
      const { error } = await supabase.from("knowledge_base_entries").insert(entries);
      if (error) throw error;
      toast.success(`Saved ${entries.length} entries to your Knowledge Base`);
      setCurrentStep(2);
    } catch (error) {
      console.error("Save KB error:", error);
      toast.error("Failed to save entries");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Save confidence threshold
      await supabase
        .from("ai_instructions")
        .upsert({
          user_id: user.id,
          auto_reply_confidence_threshold: confidence,
          system_prompt: "You are a helpful email assistant. Only answer questions using the knowledge base. If unsure, do not guess and send the email to the review queue.",
        }, { onConflict: "user_id" });

      // Mark onboarding as complete
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Finish onboarding error:", error);
      toast.error("Failed to complete setup");
    } finally {
      setIsSaving(false);
    }
  };

  const explanation = getConfidenceExplanation(confidence);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isComplete = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={i} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-px flex-1",
                      isComplete ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 1: Knowledge Base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Build Your Knowledge Base</h2>
                <p className="mt-2 text-muted-foreground">
                  Paste your website or FAQ URL and we'll generate knowledge base entries automatically.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/faq"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateKB()}
                />
                <Button onClick={handleGenerateKB} disabled={isGenerating || !url.trim()}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>

              {draftEntries.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Generated {draftEntries.length} entries — review and confirm:
                  </Label>
                  <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {draftEntries.map((entry, i) => (
                      <Card key={i} className="border border-border">
                        <CardContent className="p-3">
                          {editIndex === i ? (
                            <div className="space-y-2">
                              <Input
                                value={entry.title}
                                onChange={(e) => {
                                  const updated = [...draftEntries];
                                  updated[i] = { ...entry, title: e.target.value };
                                  setDraftEntries(updated);
                                }}
                                placeholder="Title"
                              />
                              <Textarea
                                value={entry.content}
                                onChange={(e) => {
                                  const updated = [...draftEntries];
                                  updated[i] = { ...entry, content: e.target.value };
                                  setDraftEntries(updated);
                                }}
                                rows={3}
                              />
                              <Button size="sm" onClick={() => setEditIndex(null)}>
                                Done
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-card-foreground">{entry.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditIndex(i)}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDraftEntries(draftEntries.filter((_, idx) => idx !== i))}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={handleSaveKBEntries} className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save {draftEntries.length} Entries & Continue
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                  Skip — I'll add manually later
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confidence Threshold */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Set Your Confidence Threshold</h2>
                <p className="mt-2 text-muted-foreground">
                  This controls when your AI auto-replies vs. escalates to you.
                </p>
              </div>

              <Card className="border border-border">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Threshold</Label>
                    <span className="text-3xl font-bold text-primary">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[confidence]}
                    onValueChange={([v]) => setConfidence(v)}
                    min={0.5}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className={cn("text-sm font-medium", explanation.color)}>
                    {explanation.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can change this anytime in Settings.
                  </p>
                </CardContent>
              </Card>

              <Button onClick={() => setCurrentStep(3)} className="w-full" size="lg">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3: Done */}
          {currentStep === 3 && (
            <div className="space-y-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">You're All Set!</h2>
                <p className="mt-2 text-muted-foreground">
                  Here's a summary of your setup:
                </p>
              </div>
              <Card className="border border-border text-left">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">Inbox connected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">
                      {draftEntries.length > 0
                        ? `${draftEntries.length} knowledge base entries ready`
                        : "Knowledge base — skipped (add entries later)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">
                      Confidence threshold set to {Math.round(confidence * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleFinish} className="w-full" size="lg" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Meet Your AI Agent →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
