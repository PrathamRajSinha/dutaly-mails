import { useState, useEffect } from "react";
import { Save, RotateCcw, Info, Sparkles, Loader2, MessageCircle } from "lucide-react";
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

const examplePrompts = [
  "Only answer pricing questions if the exact price is in the knowledge base",
  "Forward all partnership emails to team@company.com",
  "If someone asks for a demo, share the Calendly link",
  "Apologize and escalate if someone complains about our service",
];

export default function Instructions() {
  const { instructions, isLoading, updateInstructions, defaultInstructions } = useAIInstructions();
  
  const [localInstructions, setLocalInstructions] = useState("");
  const [tone, setTone] = useState<"formal" | "professional" | "friendly" | "concise">("professional");
  const [replyLength, setReplyLength] = useState<"short" | "medium" | "long">("medium");
  const [signature, setSignature] = useState("Best regards,\nThe Team");
  const [autoReply, setAutoReply] = useState(false);
  const [escalateUncertain, setEscalateUncertain] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [greetingEnabled, setGreetingEnabled] = useState(true);
  const [greetingTemplate, setGreetingTemplate] = useState("Hello! Thank you for reaching out. How can I assist you today?");

  // Sync local state with fetched data
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
    }
  }, [instructions, defaultInstructions]);

  const handleSave = async () => {
    await updateInstructions.mutateAsync({
      system_prompt: localInstructions,
      tone,
      reply_length: replyLength,
      signature,
      auto_reply_enabled: autoReply,
      escalate_unknown: escalateUncertain,
      auto_reply_confidence_threshold: confidenceThreshold,
      greeting_response_enabled: greetingEnabled,
      greeting_template: greetingTemplate,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI Instructions</h1>
        <p className="mt-1 text-muted-foreground">
          Tell the AI how to handle your emails in plain English
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Instructions */}
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Behavior Instructions
              </CardTitle>
              <CardDescription>
                Write your instructions in plain English. The AI will follow these rules when processing emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[400px] font-mono text-sm"
                value={localInstructions}
                onChange={(e) => setLocalInstructions(e.target.value)}
                placeholder="Enter your instructions here..."
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleSave} disabled={updateInstructions.isPending}>
                  {updateInstructions.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Quick Tips */}
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

          {/* Reply Settings */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Reply Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="space-y-2">
                <Label>Email Signature</Label>
                <Textarea
                  rows={3}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your email signature..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Behavior Toggles */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Behavior Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Auto-reply enabled</p>
                  <p className="text-xs text-muted-foreground">
                    AI can send replies automatically
                  </p>
                </div>
                <Switch checked={autoReply} onCheckedChange={setAutoReply} />
              </div>
              
              {autoReply && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div>
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
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Escalate uncertain emails
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Queue emails with low confidence
                  </p>
                </div>
                <Switch
                  checked={escalateUncertain}
                  onCheckedChange={setEscalateUncertain}
                />
              </div>
            </CardContent>
          </Card>

          {/* Greeting Settings */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-primary" />
                Greeting Response
              </CardTitle>
              <CardDescription>
                Auto-respond to simple greetings like "Hi" or "Hello"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Enable greeting response</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically reply to simple greetings
                  </p>
                </div>
                <Switch checked={greetingEnabled} onCheckedChange={setGreetingEnabled} />
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
                    This response will be sent for simple greetings (no knowledge base needed)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
