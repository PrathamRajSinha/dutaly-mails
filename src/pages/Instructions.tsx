import { useState } from "react";
import { Save, RotateCcw, Info, Sparkles } from "lucide-react";
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
import { toast } from "sonner";

const defaultInstructions = `You are an AI email assistant. Follow these rules strictly:

1. REPLYING TO EMAILS
   - Only answer questions using information from the knowledge base
   - If you're unsure or the information isn't in the knowledge base, send the email to the review queue
   - Never make up information or guess answers
   - Keep replies concise (1-2 paragraphs maximum)

2. EMAILS TO IGNORE
   - Newsletters and promotional emails
   - Cold sales pitches
   - Spam or suspicious emails
   - Emails marked as spam

3. EMAILS TO ESCALATE
   - Urgent requests or complaints
   - Requests for meetings or calls
   - Partnership inquiries
   - Any email asking for something not covered in the knowledge base

4. TONE & STYLE
   - Be professional but friendly
   - Use the user's first name when available
   - End with a helpful closing`;

const examplePrompts = [
  "Only answer pricing questions if the exact price is in the knowledge base",
  "Forward all partnership emails to team@company.com",
  "If someone asks for a demo, share the Calendly link",
  "Apologize and escalate if someone complains about our service",
];

export default function Instructions() {
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [tone, setTone] = useState("professional");
  const [replyLength, setReplyLength] = useState("medium");
  const [signature, setSignature] = useState("Best regards,\nThe Team");
  const [autoReply, setAutoReply] = useState(true);
  const [escalateUncertain, setEscalateUncertain] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Instructions saved successfully");
    }, 1000);
  };

  const handleReset = () => {
    setInstructions(defaultInstructions);
    toast.info("Instructions reset to default");
  };

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
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter your instructions here..."
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
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
                    setInstructions((prev) => prev + "\n\n" + prompt);
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
                <Select value={tone} onValueChange={setTone}>
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
                <Select value={replyLength} onValueChange={setReplyLength}>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Auto-reply enabled</p>
                  <p className="text-xs text-muted-foreground">
                    AI can send replies automatically
                  </p>
                </div>
                <Switch checked={autoReply} onCheckedChange={setAutoReply} />
              </div>
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
        </div>
      </div>
    </div>
  );
}
