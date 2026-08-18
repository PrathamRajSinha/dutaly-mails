import { useState, useEffect, useMemo } from "react";
import { 
  Save, 
  RotateCcw, 
  Info, 
  Sparkles, 
  Loader2, 
  MessageCircle, 
  Image, 
  Plus, 
  X, 
  CheckCircle, 
  Ban, 
  Mail, 
  ShieldAlert,
  Settings2,
  Type,
  Palette,
  ShieldCheck,
  Zap,
  RotateCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Accordion } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAIInstructions } from "@/hooks/useAIInstructions";
import { InstructionBuilder } from "@/components/instructions/InstructionBuilder";
import { CategoryThresholds } from "@/components/instructions/CategoryThresholds";
import { useInstructionRules, compileRulesToPrompt } from "@/hooks/useInstructionRules";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StickyHeader } from "@/components/instructions/StickyHeader";
import { AutomationSummary } from "@/components/instructions/AutomationSummary";
import { InstructionSection } from "@/components/instructions/InstructionSection";
import { cn } from "@/lib/utils";

export default function Instructions() {
  const { instructions, isLoading, updateInstructions, defaultInstructions } = useAIInstructions();
  const { rules } = useInstructionRules();
  
  const [localInstructions, setLocalInstructions] = useState("");
  const [tone, setTone] = useState<"formal" | "professional" | "friendly" | "concise">("professional");
  const [replyLength, setReplyLength] = useState<"short" | "medium" | "long">("medium");
  const [signature, setSignature] = useState("Best regards,\nThe Team");
  const [autoReply, setAutoReply] = useState(false);
  const [escalateUncertain, setEscalateUncertain] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [greetingEnabled, setGreetingEnabled] = useState(true);
  const [greetingTemplate, setGreetingTemplate] = useState("Hello! Thank you for reaching out. How can I assist you today?");
  const [emailFooter, setEmailFooter] = useState("This email was sent by an AI assistant. If you believe this was sent in error, please let us know.");
  const [logoUrl, setLogoUrl] = useState("");
  const [doRules, setDoRules] = useState<string[]>([]);
  const [doNotRules, setDoNotRules] = useState<string[]>([]);
  const [newDoRule, setNewDoRule] = useState("");
  const [newDoNotRule, setNewDoNotRule] = useState("");
  const [backupEmail, setBackupEmail] = useState("");
  const [backupEmailInput, setBackupEmailInput] = useState("");
  const [escalationConditions, setEscalationConditions] = useState<string[]>([]);
  
  const [showBackupEmailConfirm, setShowBackupEmailConfirm] = useState(false);
  const [showAutoReplyConfirm, setShowAutoReplyConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showThresholdConfirm, setShowThresholdConfirm] = useState(false);
  const [pendingThreshold, setPendingThreshold] = useState(0.8);

  const setInitialState = () => {
    if (instructions) {
      setLocalInstructions(instructions.system_prompt || defaultInstructions);
      setTone(instructions.tone || "professional");
      setReplyLength(instructions.reply_length || "medium");
      setSignature(instructions.signature || "Best regards,\nThe Team");
      setAutoReply(instructions.auto_reply_enabled ?? false);
      setEscalateUncertain(instructions.escalate_unknown ?? true);
      setConfidenceThreshold(instructions.auto_reply_confidence_threshold ?? 0.8);
      setGreetingEnabled(instructions.greeting_response_enabled ?? true);
      setGreetingTemplate(instructions.greeting_template || "Hello! Thank you for reaching out. How can I assist you today?");
      setEmailFooter(instructions.email_footer ?? "This email was sent by an AI assistant. If you believe this was sent in error, please let us know.");
      setLogoUrl(instructions.logo_url || "");
      setDoRules(instructions.do_rules || []);
      setDoNotRules(instructions.do_not_rules || []);
      setBackupEmail(instructions.backup_email || "");
      setEscalationConditions(instructions.escalation_conditions || []);
    }
  };

  useEffect(() => {
    setInitialState();
  }, [instructions, defaultInstructions]);

  const isDirty = useMemo(() => {
    if (!instructions) return false;
    
    return (
      localInstructions !== (instructions.system_prompt || defaultInstructions) ||
      tone !== (instructions.tone || "professional") ||
      replyLength !== (instructions.reply_length || "medium") ||
      signature !== (instructions.signature || "Best regards,\nThe Team") ||
      autoReply !== (instructions.auto_reply_enabled ?? false) ||
      escalateUncertain !== (instructions.escalate_unknown ?? true) ||
      confidenceThreshold !== (instructions.auto_reply_confidence_threshold ?? 0.8) ||
      greetingEnabled !== (instructions.greeting_response_enabled ?? true) ||
      greetingTemplate !== (instructions.greeting_template || "Hello! Thank you for reaching out. How can I assist you today?") ||
      emailFooter !== (instructions.email_footer ?? "This email was sent by an AI assistant. If you believe this was sent in error, please let us know.") ||
      logoUrl !== (instructions.logo_url || "") ||
      JSON.stringify(doRules) !== JSON.stringify(instructions.do_rules || []) ||
      JSON.stringify(doNotRules) !== JSON.stringify(instructions.do_not_rules || []) ||
      backupEmail !== (instructions.backup_email || "") ||
      JSON.stringify(escalationConditions) !== JSON.stringify(instructions.escalation_conditions || [])
    );
  }, [
    instructions, 
    localInstructions, 
    tone, 
    replyLength, 
    signature, 
    autoReply, 
    escalateUncertain, 
    confidenceThreshold, 
    greetingEnabled, 
    greetingTemplate, 
    emailFooter, 
    logoUrl, 
    doRules, 
    doNotRules, 
    backupEmail, 
    escalationConditions,
    defaultInstructions
  ]);

  const handleSave = async () => {
    const compiledPrompt = rules.length > 0 ? compileRulesToPrompt(rules) : localInstructions;
    await updateInstructions.mutateAsync({
      system_prompt: compiledPrompt,
      tone,
      reply_length: replyLength,
      signature,
      auto_reply_enabled: autoReply,
      escalate_unknown: escalateUncertain,
      auto_reply_confidence_threshold: confidenceThreshold,
      greeting_response_enabled: greetingEnabled,
      greeting_template: greetingTemplate,
      email_footer: emailFooter,
      logo_url: logoUrl || null,
      do_rules: doRules,
      do_not_rules: doNotRules,
      backup_email: backupEmail || null,
      escalation_conditions: escalationConditions,
    });
  };

  const handleDiscard = () => {
    setInitialState();
    toast.info("Changes discarded");
  };

  const handleResetToDefault = () => {
    setLocalInstructions(defaultInstructions);
    toast.info("System prompt reset to default (save to apply)");
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-8 pb-12">
      <StickyHeader 
        isDirty={isDirty} 
        isSaving={updateInstructions.isPending} 
        onSave={handleSave} 
        onDiscard={handleDiscard} 
      />

      <AutomationSummary 
        autoReply={autoReply}
        confidenceThreshold={confidenceThreshold}
        backupEmail={backupEmail}
        escalateUncertain={escalateUncertain}
      />

      <Accordion type="multiple" defaultValue={["core-instructions", "automation-settings"]} className="w-full">
        {/* Core AI Instructions */}
        <InstructionSection 
          id="core-instructions"
          title="Core Behavior & Rules"
          description="Define the fundamental logic for how the AI interacts with your customers."
          icon={<Sparkles className="h-5 w-5" />}
        >
          <div className="space-y-8 py-2">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Instruction Builder</Label>
                <Button variant="ghost" size="sm" onClick={handleResetToDefault} className="text-xs text-[#9490B8] hover:text-primary">
                  <RotateCw className="mr-1.5 h-3 w-3" />
                  Reset to Default
                </Button>
              </div>
              <InstructionBuilder />
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100">
              {/* DO rules */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Positive Constraints (DO)
                </Label>
                <div className="space-y-2">
                  {doRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 py-2">
                      <span className="flex-1 text-sm text-[#3D3A5C]">{rule}</span>
                      <button
                        onClick={() => setDoRules(doRules.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newDoRule}
                      onChange={(e) => setNewDoRule(e.target.value)}
                      placeholder="e.g. Always mention our refund policy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newDoRule.trim()) {
                          setDoRules([...doRules, newDoRule.trim()]);
                          setNewDoRule("");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (newDoRule.trim()) {
                          setDoRules([...doRules, newDoRule.trim()]);
                          setNewDoRule("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* DON'T rules */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <Ban className="h-4 w-4" />
                  Negative Constraints (DON'T)
                </Label>
                <div className="space-y-2">
                  {doNotRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-destructive/10 bg-destructive/5 px-3 py-2">
                      <span className="flex-1 text-sm text-[#3D3A5C]">{rule}</span>
                      <button
                        onClick={() => setDoNotRules(doNotRules.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newDoNotRule}
                      onChange={(e) => setNewDoNotRule(e.target.value)}
                      placeholder="e.g. Never promise specific dates"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newDoNotRule.trim()) {
                          setDoNotRules([...doNotRules, newDoNotRule.trim()]);
                          setNewDoNotRule("");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (newDoNotRule.trim()) {
                          setDoNotRules([...doNotRules, newDoNotRule.trim()]);
                          setNewDoNotRule("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InstructionSection>

        {/* Automation Settings */}
        <InstructionSection 
          id="automation-settings"
          title="Automation & Escalation"
          description="Control when the AI sends emails vs when it asks for your review."
          icon={<Settings2 className="h-5 w-5" />}
        >
          <div className="space-y-6 py-2">
             <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-xl border p-4 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1730]">Review Mode (Approval Only)</p>
                      <p className="text-xs text-[#9490B8]">AI drafts replies but never sends them automatically.</p>
                    </div>
                    <Switch 
                      checked={!autoReply} 
                      onCheckedChange={(v) => {
                        if (!v) {
                          // Switching FROM Review Mode TO Auto-Reply
                          setShowAutoReplyConfirm(true);
                        } else {
                          // Switching FROM Auto-Reply TO Review Mode
                          setShowPauseConfirm(true);
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1730]">Auto-Send Enabled</p>
                      <p className="text-xs text-[#9490B8]">AI will automatically send replies when confident.</p>
                    </div>
                    <Switch 
                      checked={autoReply} 
                      onCheckedChange={(v) => {
                        if (v) {
                          setShowAutoReplyConfirm(true);
                        } else {
                          setShowPauseConfirm(true);
                        }
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border p-4 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1730]">Confidence Threshold</p>
                      <p className="text-xs text-[#9490B8]">Minimum confidence needed to auto-send.</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={([v]) => {
                      setPendingThreshold(v);
                      setShowThresholdConfirm(true);
                    }}
                    min={0.5}
                    max={1}
                    step={0.05}
                    disabled={!autoReply}
                    className="w-full"
                  />
                  {!autoReply && <p className="text-[10px] text-amber-600 font-medium">Threshold ignored in Review Mode</p>}
                </div>
             </div>

             <div className="space-y-4">
                <Label className="text-sm font-semibold">Category Specific Overrides</Label>
                <CategoryThresholds globalThreshold={confidenceThreshold} />
             </div>

             <div className="rounded-xl border p-4 bg-slate-50/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1730]">Safety & Escalation</p>
                    <p className="text-xs text-[#9490B8]">Handle uncertainty and critical emails.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Escalate uncertain emails</p>
                      <p className="text-xs text-[#9490B8]">Queue emails below threshold for review.</p>
                    </div>
                    <Switch checked={escalateUncertain} onCheckedChange={setEscalateUncertain} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase text-[#9490B8]">Escalation Destination</Label>
                    {backupEmail ? (
                      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="flex-1 text-sm font-medium">{backupEmail}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-primary"
                          onClick={() => {
                            setBackupEmailInput(backupEmail);
                            setShowBackupEmailConfirm(true);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => setShowBackupEmailConfirm(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Backup Email
                      </Button>
                    )}
                  </div>
                </div>
             </div>
          </div>
        </InstructionSection>

        {/* Tone & Branding */}
        <InstructionSection 
          id="tone-branding"
          title="Tone, Style & Branding"
          description="Customize the personality and visual identity of your AI's replies."
          icon={<Palette className="h-5 w-5" />}
        >
          <div className="space-y-8 py-2">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Writing Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Reply Length</Label>
                <Select value={replyLength} onValueChange={(v) => setReplyLength(v as typeof replyLength)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1 paragraph)</SelectItem>
                    <SelectItem value="medium">Medium (2 paragraphs)</SelectItem>
                    <SelectItem value="long">Long (detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email Signature</Label>
                  <Textarea
                    rows={4}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Best regards,\nThe Support Team"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email Footer</Label>
                  <Textarea
                    rows={4}
                    value={emailFooter}
                    onChange={(e) => setEmailFooter(e.target.value)}
                    placeholder="This was generated by AI..."
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <Label className="text-sm font-semibold">Branding</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="bg-white"
                  />
                  <p className="text-xs text-[#9490B8]">URL to your company logo (PNG/JPG recommended).</p>
                </div>
                {logoUrl && (
                  <div className="h-20 w-32 rounded-lg border bg-slate-50 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </InstructionSection>

        {/* Greetings */}
        <InstructionSection 
          id="greetings"
          title="Greeting Responses"
          description="Configure how the AI handles simple greetings like 'Hi' or 'Hello'."
          icon={<MessageCircle className="h-5 w-5" />}
        >
          <div className="space-y-6 py-2">
             <div className="flex items-center justify-between rounded-xl border p-4 bg-slate-50/30">
                <div>
                  <p className="text-sm font-semibold text-[#1A1730]">Enable greeting response</p>
                  <p className="text-xs text-[#9490B8]">Automatically reply to simple greetings without searching knowledge base.</p>
                </div>
                <Switch checked={greetingEnabled} onCheckedChange={setGreetingEnabled} />
             </div>
             
             {greetingEnabled && (
               <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                 <Label className="text-sm font-semibold">Greeting Template</Label>
                 <Textarea
                   rows={3}
                   value={greetingTemplate}
                   onChange={(e) => setGreetingTemplate(e.target.value)}
                   placeholder="Hello! How can I help you today?"
                   className="bg-white"
                 />
               </div>
             )}
          </div>
        </InstructionSection>
      </Accordion>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showBackupEmailConfirm} onOpenChange={setShowBackupEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Configure Backup Email</AlertDialogTitle>
            <AlertDialogDescription>
              Critical alerts and escalations for <strong>all connected accounts</strong> will be sent to this address.
            </AlertDialogDescription>
            <div className="mt-4">
              <Input
                value={backupEmailInput}
                onChange={(e) => setBackupEmailInput(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setBackupEmail(backupEmailInput);
                setShowBackupEmailConfirm(false);
              }}
            >
              Update Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAutoReplyConfirm} onOpenChange={setShowAutoReplyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Enable Auto-Reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow the AI to send replies automatically to <strong>all connected accounts</strong> when it meets the confidence threshold. This is a risky action that affects live customer communication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAutoReply(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setAutoReply(true);
                setShowAutoReplyConfirm(false);
              }}
            >
              Enable Auto-Reply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPauseConfirm} onOpenChange={setShowPauseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Auto-Reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the AI from sending replies automatically for <strong>all connected accounts</strong>. You will need to manually approve all drafts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                setAutoReply(false);
                setShowPauseConfirm(false);
              }}
            >
              Pause Automation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showThresholdConfirm} onOpenChange={setShowThresholdConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Confidence Threshold?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing this affects <strong>all connected accounts</strong>. A lower threshold increases automation but carries higher risk of incorrect AI replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfidenceThreshold(pendingThreshold);
                setShowThresholdConfirm(false);
              }}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
