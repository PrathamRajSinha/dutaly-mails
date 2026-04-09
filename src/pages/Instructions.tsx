import { useState, useEffect, useRef } from "react";
import { Save, RotateCcw, Info, Sparkles, Loader2, MessageCircle, Image, Plus, X, CheckCircle, Ban, Mail, ShieldAlert } from "lucide-react";
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

const examplePrompts = [
  "Only answer pricing questions if the exact price is in the knowledge base",
  "Forward all partnership emails to team@company.com",
  "If someone asks for a demo, share the Calendly link",
  "Apologize and escalate if someone complains about our service",
];

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
  const [newCondition, setNewCondition] = useState("");
  const [showBackupEmailConfirm, setShowBackupEmailConfirm] = useState(false);
  const [showAutoReplyConfirm, setShowAutoReplyConfirm] = useState(false);
  const [showThresholdConfirm, setShowThresholdConfirm] = useState(false);
  const [pendingThreshold, setPendingThreshold] = useState(0.8);

  const saveToggle = (updates: Record<string, unknown>) => {
    const payload = {
      system_prompt: localInstructions || defaultInstructions,
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
      ...updates,
    };
    updateInstructions.mutate(payload as any);
  };

  useEffect(() => {
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
      setEmailFooter(instructions.email_footer || "This email was sent by an AI assistant. If you believe this was sent in error, please let us know.");
      setLogoUrl(instructions.logo_url || "");
      setDoRules(instructions.do_rules || []);
      setDoNotRules(instructions.do_not_rules || []);
      setBackupEmail(instructions.backup_email || "");
      setEscalationConditions(instructions.escalation_conditions || []);
    }
  }, [instructions, defaultInstructions]);

  const handleSave = async () => {
    // Compile structured rules into system_prompt if rules exist, otherwise use local instructions
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

  const handleReset = () => {
    setLocalInstructions(defaultInstructions);
    toast.info("Instructions reset to default");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[#1A1730]">AI Instructions</h1>
          <p className="mt-1 text-[13px] text-[#9490B8]">
            Tell the AI how to handle your emails in plain English
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={updateInstructions.isPending}>
            {updateInstructions.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Structured Instruction Builder */}
          <InstructionBuilder />

          {/* Do & Don't Rules */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Do & Don't Rules</CardTitle>
              <CardDescription>
                Specific rules the AI must always follow or avoid when replying.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DO rules */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CheckCircle className="h-4 w-4" />
                  DO (Always follow)
                </Label>
                <div className="space-y-2">
                  {doRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-[10px] border-l-[3px] border-l-[#1D9E75] bg-[#F6FFF9] px-3 py-2">
                      <span className="flex-1 text-sm text-foreground">{rule}</span>
                      <button
                        onClick={() => setDoRules(doRules.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newDoRule}
                      onChange={(e) => setNewDoRule(e.target.value)}
                      placeholder="e.g. Always include a link to our FAQ page"
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
                  DON'T (Never do)
                </Label>
                <div className="space-y-2">
                  {doNotRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-[10px] border-l-[3px] border-l-[#DC2626] bg-[#FFF5F5] px-3 py-2">
                      <span className="flex-1 text-sm text-foreground">{rule}</span>
                      <button
                        onClick={() => setDoNotRules(doNotRules.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newDoNotRule}
                      onChange={(e) => setNewDoNotRule(e.target.value)}
                      placeholder="e.g. Never make up pricing information"
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
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Reply Style</CardTitle>
              <CardDescription>Control the tone and length of AI-generated replies.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger>
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
                  <Label>Reply Length</Label>
                  <Select value={replyLength} onValueChange={(v) => setReplyLength(v as typeof replyLength)}>
                    <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Signature & Footer */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Signature & Footer</CardTitle>
              <CardDescription>Customize the closing of every email reply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Signature</Label>
                <Textarea
                  rows={3}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your email signature..."
                />
              </div>
              <div className="space-y-2">
                <Label>Email Footer</Label>
                <Textarea
                  rows={2}
                  value={emailFooter}
                  onChange={(e) => setEmailFooter(e.target.value)}
                  placeholder="Footer text appended to every email..."
                />
                <p className="text-xs text-muted-foreground">
                  Appears at the bottom of every sent email
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Automation Controls */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Automation Controls</CardTitle>
              <CardDescription>Configure when and how the AI acts on your behalf.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Auto-reply enabled</p>
                  <p className="text-xs text-muted-foreground">AI sends replies automatically</p>
                </div>
                <Switch checked={autoReply} onCheckedChange={(v) => {
                  if (v) {
                    setShowAutoReplyConfirm(true);
                  } else {
                    setAutoReply(false);
                    saveToggle({ auto_reply_enabled: false });
                  }
                }} />
              </div>
              
              {autoReply && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm">Confidence Threshold</Label>
                    <span className="text-sm font-medium text-[#7C6FE0]">{Math.round(confidenceThreshold * 100)}%</span>
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
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only auto-send when AI confidence exceeds this threshold
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Escalate uncertain emails</p>
                  <p className="text-xs text-muted-foreground">Queue emails with low confidence</p>
                </div>
                <Switch checked={escalateUncertain} onCheckedChange={(v) => { setEscalateUncertain(v); saveToggle({ escalate_unknown: v }); }} />
              </div>
            </CardContent>
          </Card>

          {/* Greeting Response */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-primary" />
                Greeting Response
              </CardTitle>
              <CardDescription>Auto-respond to simple greetings like "Hi" or "Hello".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Enable greeting response</p>
                  <p className="text-xs text-muted-foreground">Automatically reply to simple greetings</p>
                </div>
                <Switch checked={greetingEnabled} onCheckedChange={(v) => { setGreetingEnabled(v); saveToggle({ greeting_response_enabled: v }); }} />
              </div>
              
              {greetingEnabled && (
                <div className="space-y-2">
                  <Label>Greeting Template</Label>
                  <Textarea
                    rows={3}
                    value={greetingTemplate}
                    onChange={(e) => setGreetingTemplate(e.target.value)}
                    placeholder="Your greeting response..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Sent for simple greetings (no knowledge base needed)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4 text-primary" />
                Branding
              </CardTitle>
              <CardDescription>Add your logo to email replies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              {logoUrl && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-12 max-w-[200px] object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Email */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Backup Email (Escalation)
              </CardTitle>
              <CardDescription>
                When an urgent or uncertain email arrives, a notification will be sent to this address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {backupEmail ? (
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-sm font-medium text-foreground">{backupEmail}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBackupEmailInput("");
                      setShowBackupEmailConfirm(true);
                    }}
                  >
                    Change
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setBackupEmail("");
                      saveToggle({ backup_email: null });
                      toast.success("Backup email removed");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={backupEmailInput}
                      onChange={(e) => setBackupEmailInput(e.target.value)}
                      placeholder="e.g. manager@company.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && backupEmailInput.trim()) {
                          setShowBackupEmailConfirm(true);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (backupEmailInput.trim()) {
                          setShowBackupEmailConfirm(true);
                        } else {
                          toast.error("Please enter an email address");
                        }
                      }}
                    >
                      Set
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Urgent, doubtful, or escalated emails will trigger a notification to this address
                  </p>
                </div>
              )}

              {/* Escalation Conditions */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Escalation Conditions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Define when the backup email should be notified. The AI will check incoming emails against these conditions.
                </p>
                <div className="space-y-2">
                  {escalationConditions.map((condition, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                      <span className="flex-1 text-sm text-foreground">{condition}</span>
                      <button
                        onClick={() => setEscalationConditions(escalationConditions.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="e.g. Email mentions 'urgent' or 'ASAP'"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newCondition.trim()) {
                          setEscalationConditions([...escalationConditions, newCondition.trim()]);
                          setNewCondition("");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (newCondition.trim()) {
                          setEscalationConditions([...escalationConditions, newCondition.trim()]);
                          setNewCondition("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Thresholds */}
          <CategoryThresholds globalThreshold={confidenceThreshold} />

          {/* Example Instructions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" />
                Example Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <p
                  key={i}
                  className="cursor-pointer rounded-lg bg-card p-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setLocalInstructions((prev) => prev + "\n\n" + prompt);
                    toast.success("Added to instructions");
                  }}
                >
                  "{prompt}"
                </p>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Click any example to add it to your instructions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confidence threshold confirmation dialog */}
      <AlertDialog open={showThresholdConfirm} onOpenChange={(open) => {
        if (!open) setPendingThreshold(confidenceThreshold);
        setShowThresholdConfirm(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Confidence Threshold?</AlertDialogTitle>
            <AlertDialogDescription>
              You're changing the auto-reply confidence threshold from {Math.round(confidenceThreshold * 100)}% to {Math.round(pendingThreshold * 100)}%. This affects which emails get auto-replied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setConfidenceThreshold(pendingThreshold);
              saveToggle({ auto_reply_confidence_threshold: pendingThreshold });
            }}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-reply confirmation dialog */}
      <AlertDialog open={showAutoReplyConfirm} onOpenChange={setShowAutoReplyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Auto-Reply?</AlertDialogTitle>
            <AlertDialogDescription>
              When enabled, the AI will automatically send replies to incoming emails that meet the confidence threshold. Make sure your instructions and knowledge base are configured properly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 my-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Confidence Threshold</Label>
              <span className="text-sm font-medium text-primary">{Math.round(confidenceThreshold * 100)}%</span>
            </div>
            <Slider
              value={[confidenceThreshold]}
              onValueChange={([v]) => setConfidenceThreshold(v)}
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only auto-send replies when AI confidence is above this threshold
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setAutoReply(true);
              saveToggle({ auto_reply_enabled: true, auto_reply_confidence_threshold: confidenceThreshold });
            }}>
              Enable Auto-Reply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backup email confirmation dialog */}
      <AlertDialog open={showBackupEmailConfirm} onOpenChange={setShowBackupEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Backup Email</AlertDialogTitle>
            <AlertDialogDescription>
              {backupEmail
                ? `You're changing the backup email from "${backupEmail}" to a new address. Please enter and confirm the new email below.`
                : "Urgent or doubtful emails will trigger a notification to this address. Please confirm the email is correct."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 my-2">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={backupEmailInput}
                onChange={(e) => setBackupEmailInput(e.target.value)}
                placeholder="Enter backup email address"
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>When does this trigger?</strong> The system will send a notification to this email when it detects an urgent request, a complaint, or an email it's uncertain how to handle.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const email = backupEmailInput.trim();
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                setBackupEmail(email);
                saveToggle({ backup_email: email });
                toast.success(`Backup email set to ${email}`);
              }}
            >
              Confirm Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}