import { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmailTemplateInput } from "@/hooks/useEmailTemplates";
import { renderEmailHtml } from "@/lib/emailHtml";
import { Badge } from "@/components/ui/badge";
import { Info, Type, Palette, Layout, MousePointer2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateEditorProps {
  form: EmailTemplateInput;
  setForm: (form: EmailTemplateInput) => void;
}

const variableChips = [
  { label: "{{sender_name}}", desc: "Sender's name" },
  { label: "{{subject}}", desc: "Email subject" },
  { label: "{{my_name}}", desc: "Your name" },
  { label: "{{date}}", desc: "Today's date" },
];

export function TemplateEditor({ form, setForm }: TemplateEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + variable + text.substring(end);
    
    setForm({ ...form, body: newText });
    
    // Reset focus and selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const previewHtml = renderEmailHtml(form.body || "Your email content will appear here...", {
    accent_color: form.accent_color,
    footer_text: form.footer_text,
    footer_logo_url: form.footer_logo_url,
    font_family: form.font_family,
    font_size: form.font_size,
    text_color: form.text_color,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
      <div className="space-y-6 pr-2 lg:border-r border-slate-100 overflow-y-auto max-h-[70vh]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Basic Info</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Pricing Inquiry"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., general, support"
                className="bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Email Content</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Body Message</Label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MousePointer2 className="h-3 w-3" /> Click variables to insert at cursor
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {variableChips.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => insertVariable(v.label)}
                  className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-slate-700 hover:bg-primary hover:text-white transition-colors border border-slate-200"
                  title={v.desc}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <Textarea
              ref={bodyRef}
              id="body"
              className="min-h-[250px] font-mono text-sm leading-relaxed bg-white focus:ring-primary border-slate-200"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Hello {{sender_name}},&#10;&#10;Thank you for reaching out..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Branding & Styles</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200 p-1 bg-white"
                />
                <Input
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="flex-1 text-xs font-mono uppercase"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Footer Logo URL</Label>
              <Input
                value={form.footer_logo_url}
                onChange={(e) => setForm({ ...form, footer_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Footer Text</Label>
            <Textarea
              className="min-h-[60px] text-sm bg-white"
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
              placeholder="e.g., Company Inc. - All rights reserved"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-100 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Live Preview</h3>
          </div>
          <Badge variant="outline" className="bg-white text-[10px] text-slate-400 border-slate-200">Auto-updating</Badge>
        </div>
        
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
          <div className="flex-1 p-6 overflow-y-auto prose prose-sm max-w-none">
             <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}
