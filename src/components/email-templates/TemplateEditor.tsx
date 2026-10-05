import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmailTemplateInput } from "@/hooks/useEmailTemplates";
import { renderEmailHtml, fontStacks, fontLabels } from "@/lib/emailHtml";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Type, Palette, Layout, Eye, Bold, Italic, Underline, Strikethrough, Heading2, List, ListOrdered,
  Quote, Link2, Highlighter, Baseline, Wand2, Loader2, PenLine, Undo2,
} from "lucide-react";

interface TemplateEditorProps {
  form: EmailTemplateInput;
  setForm: (form: EmailTemplateInput) => void;
}

const variableChips = [
  { label: "{{sender_name}}", desc: "Customer's name" },
  { label: "{{subject}}", desc: "Email subject" },
  { label: "{{my_name}}", desc: "Your name" },
  { label: "{{date}}", desc: "Today's date" },
];

const TONES = ["Friendly", "Professional", "Formal", "Warm & empathetic", "Short & direct", "Playful"];
const SIZES = [
  { v: "xsmall", l: "Extra small" }, { v: "small", l: "Small" }, { v: "medium", l: "Medium" },
  { v: "large", l: "Large" }, { v: "xlarge", l: "Extra large" },
];
const SWATCHES = ["#111827", "#374151", "#6B7280", "#DC2626", "#EA580C", "#16A34A", "#2563EB", "#7C6FE0", "#DB2777"];

export function TemplateEditor({ form, setForm }: TemplateEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [improveNote, setImproveNote] = useState("");
  const [busy, setBusy] = useState<null | "generate" | "improve">(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [inlineColor, setInlineColor] = useState("#DC2626");

  const update = (body: string) => setForm({ ...form, body });

  /** Wrap the selection in tags, or insert at the cursor. */
  const wrap = (open: string, close = "", placeholder = "text") => {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + open + sel + close + value.slice(e);
    update(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + open.length, s + open.length + sel.length);
    }, 0);
  };

  const list = (tag: "ul" | "ol") => {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const lines = (value.slice(s, e) || "Item one\nItem two").split("\n").filter(Boolean);
    const block = `\n<${tag}>\n${lines.map((l) => `<li>${l}</li>`).join("\n")}\n</${tag}>\n`;
    update(value.slice(0, s) + block + value.slice(e));
    setTimeout(() => ta.focus(), 0);
  };

  const insertLink = () => {
    const url = window.prompt("Link address (https://…)", "https://");
    if (!url || !/^(https?:\/\/|mailto:)/i.test(url)) return;
    wrap(`<a href="${url.replace(/"/g, "")}">`, "</a>", "link text");
  };

  const runAi = async (mode: "generate" | "improve", instructions?: string) => {
    setBusy(mode);
    try {
      const { data, error } = await supabase.functions.invoke("template-ai", {
        body: { mode, prompt: mode === "generate" ? aiPrompt : instructions ?? "", body: form.body, tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPrevious(form.body);
      setForm({
        ...form,
        body: data.body,
        ...(mode === "generate" && !form.name && data.name ? { name: data.name } : {}),
        ...(mode === "generate" && (!form.category || form.category === "general") && data.category ? { category: data.category } : {}),
        ...(mode === "generate" && !form.footer_text && data.footer_text ? { footer_text: data.footer_text } : {}),
      });
      toast.success(mode === "generate" ? "Template written" : "Template improved");
      setImproveNote("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The AI couldn't do that. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const previewHtml = renderEmailHtml(form.body || "Your email content will appear here...", {
    accent_color: form.accent_color,
    footer_text: form.footer_text,
    footer_logo_url: form.footer_logo_url,
    font_family: form.font_family,
    font_size: form.font_size,
    text_color: form.text_color,
  });

  const Tool = ({ icon: Icon, label, onClick }: { icon: typeof Bold; label: string; onClick: () => void }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClick} aria-label={label}>
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  const SectionTitle = ({ icon: Icon, children }: { icon: typeof Bold; children: string }) => (
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{children}</h3>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid h-full min-h-[500px] grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2 lg:border-r lg:border-border">
          {/* AI writer */}
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <SectionTitle icon={Wand2}>AI template maker</SectionTitle>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Apology for a delayed order, offer 10% off the next purchase"
              className="min-h-[64px] bg-background text-sm placeholder:text-muted-foreground/60"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-9 w-[190px] bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" size="sm" onClick={() => runAi("generate")} disabled={!!busy || !aiPrompt.trim()}>
                {busy === "generate" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-1.5 h-3.5 w-3.5" />}
                {form.body.trim() ? "Rewrite with AI" : "Write with AI"}
              </Button>
              {previous !== null && (
                <Button type="button" size="sm" variant="ghost" onClick={() => { update(previous); setPrevious(null); }}>
                  <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo AI
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={Layout}>Basic info</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template name</Label>
                <Input id="template-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Pricing Inquiry" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., general, support" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle icon={Type}>Email content</SectionTitle>
              <div className="flex gap-1.5">
                <Button type="button" size="sm" variant="outline" disabled={!!busy || !form.body.trim()} onClick={() => runAi("improve")}>
                  {busy === "improve" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-1.5 h-3.5 w-3.5" />}Improve
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={!!busy || !form.body.trim()}>
                      <PenLine className="mr-1.5 h-3.5 w-3.5" />With instructions
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 space-y-2">
                    <Label className="text-xs">How should the AI change it?</Label>
                    <Textarea
                      value={improveNote}
                      maxLength={500}
                      onChange={(e) => setImproveNote(e.target.value)}
                      placeholder="Make it shorter, add a clear call to action, mention 24/7 support…"
                      className="min-h-[80px] text-sm placeholder:text-muted-foreground/60"
                    />
                    <Button type="button" size="sm" className="w-full" disabled={!!busy || !improveNote.trim()} onClick={() => runAi("improve", improveNote)}>
                      {busy === "improve" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Apply
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Formatting toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 border-border bg-muted/40 p-1">
              <Tool icon={Bold} label="Bold" onClick={() => wrap("<b>", "</b>")} />
              <Tool icon={Italic} label="Italic" onClick={() => wrap("<i>", "</i>")} />
              <Tool icon={Underline} label="Underline" onClick={() => wrap("<u>", "</u>")} />
              <Tool icon={Strikethrough} label="Strikethrough" onClick={() => wrap("<s>", "</s>")} />
              <div className="mx-1 h-5 w-px bg-border" />
              <Tool icon={Heading2} label="Heading" onClick={() => wrap("<h3>", "</h3>", "Heading")} />
              <Tool icon={List} label="Bulleted list" onClick={() => list("ul")} />
              <Tool icon={ListOrdered} label="Numbered list" onClick={() => list("ol")} />
              <Tool icon={Quote} label="Quote" onClick={() => wrap("<blockquote>", "</blockquote>")} />
              <Tool icon={Link2} label="Link" onClick={insertLink} />
              <div className="mx-1 h-5 w-px bg-border" />
              <Tool icon={Highlighter} label="Highlight" onClick={() => wrap("<mark>", "</mark>")} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Text colour">
                    <Baseline className="h-4 w-4" style={{ color: inlineColor }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 space-y-2">
                  <Label className="text-xs">Colour for selected text</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SWATCHES.map((c) => (
                      <button key={c} type="button" onClick={() => { setInlineColor(c); wrap(`<span style="color:${c}">`, "</span>"); }}
                        className="h-6 w-6 rounded-full border border-border" style={{ background: c }} aria-label={c} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="color" value={inlineColor} onChange={(e) => setInlineColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border bg-background p-0.5" />
                    <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => wrap(`<span style="color:${inlineColor}">`, "</span>")}>Apply</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Textarea
              ref={bodyRef}
              id="body"
              className="-mt-3 min-h-[250px] rounded-t-none font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60"
              value={form.body}
              onChange={(e) => update(e.target.value)}
              placeholder={"Hello {{sender_name}},\n\nThank you for reaching out..."}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Insert:</span>
              {variableChips.map((v) => (
                <button key={v.label} type="button" onClick={() => wrap("", "", v.label)} title={v.desc}
                  className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={Palette}>Fonts & colours</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font</Label>
                <Select value={form.font_family || "sans-serif"} onValueChange={(v) => setForm({ ...form, font_family: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(fontStacks).map((k) => (
                      <SelectItem key={k} value={k}><span style={{ fontFamily: fontStacks[k] }}>{fontLabels[k]}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text size</Label>
                <Select value={form.font_size || "medium"} onValueChange={(v) => setForm({ ...form, font_size: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SIZES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {(["text_color", "accent_color"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label>{field === "text_color" ? "Text colour" : "Accent colour"}</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form[field] || "#000000"} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-border bg-background p-1" />
                    <Input value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="flex-1 font-mono text-xs uppercase" />
                  </div>
                  <div className="flex gap-1">
                    {SWATCHES.slice(0, 7).map((c) => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, [field]: c })} aria-label={c}
                        className="h-5 w-5 rounded-full border border-border" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Footer logo URL</Label>
              <Input value={form.footer_logo_url} onChange={(e) => setForm({ ...form, footer_logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label>Footer text</Label>
              <Textarea className="min-h-[60px] text-sm" value={form.footer_text}
                onChange={(e) => setForm({ ...form, footer_text: e.target.value })} placeholder="e.g., Company Inc. - All rights reserved" />
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-muted/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live preview</h3>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Auto-updating</Badge>
          </div>
          {/* Email preview stays white like a real inbox */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border shadow-sm" style={{ background: "#ffffff" }}>
            <div className="flex h-8 items-center gap-1.5 border-b border-border bg-muted/40 px-3">
              <div className="h-2 w-2 rounded-full bg-border" />
              <div className="h-2 w-2 rounded-full bg-border" />
              <div className="h-2 w-2 rounded-full bg-border" />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
