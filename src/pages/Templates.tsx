import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useEmailTemplates, type EmailTemplate, type EmailTemplateInput } from "@/hooks/useEmailTemplates";
import { renderEmailHtml } from "@/lib/emailHtml";

const defaultTemplate: EmailTemplateInput = {
  name: "",
  category: "general",
  body: "",
  accent_color: "#4F46E5",
  footer_text: "",
  footer_logo_url: "",
};

const variableChips = [
  { label: "{{sender_name}}", desc: "Sender's name" },
  { label: "{{subject}}", desc: "Email subject" },
  { label: "{{my_name}}", desc: "Your name" },
  { label: "{{date}}", desc: "Today's date" },
];

export default function Templates() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmailTemplateInput>(defaultTemplate);
  const [showPreview, setShowPreview] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultTemplate);
    setShowPreview(false);
    setDialogOpen(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      category: t.category,
      body: t.body,
      font_family: t.font_family,
      font_size: t.font_size,
      text_color: t.text_color,
      accent_color: t.accent_color,
      footer_text: t.footer_text,
      footer_logo_url: t.footer_logo_url,
    });
    setShowPreview(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) return;
    if (editingId) {
      await updateTemplate.mutateAsync({ id: editingId, ...form });
    } else {
      await createTemplate.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const previewHtml = renderEmailHtml(form.body || "Your email content will appear here...", form);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Create reusable styled email templates with custom fonts, colors, and footers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Variable reference */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-2 self-center">Available variables:</span>
        {variableChips.map((v) => (
          <Badge key={v.label} variant="outline" className="text-xs font-mono">
            {v.label}
          </Badge>
        ))}
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No templates yet</h3>
          <p className="mt-1 text-muted-foreground">Create your first email template to get started.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-card-foreground">{t.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                      {t.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { setDeleteId(t.id); setDeleteDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{t.body}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{t.font_family}</span>
                  <span>•</span>
                  <span className="capitalize">{t.font_size}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: t.text_color }} />
                    <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: t.accent_color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              Design your email template with custom styling and content.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            {/* Left: Form */}
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Pricing Inquiry"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., general, support, sales"
                />
              </div>

              <div>
                <Label>Body</Label>
                <Textarea
                  className="min-h-[140px] font-mono text-sm"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Hello {{sender_name}},&#10;&#10;Thank you for reaching out about {{subject}}..."
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {variableChips.map((v) => (
                    <button
                      key={v.label}
                      type="button"
                      className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-accent transition-colors font-mono"
                      onClick={() => setForm({ ...form, body: form.body + v.label })}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Font Family</Label>
                  <Select value={form.font_family} onValueChange={(v) => setForm({ ...form, font_family: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">Sans-serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size</Label>
                  <Select value={form.font_size} onValueChange={(v) => setForm({ ...form, font_size: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (13px)</SelectItem>
                      <SelectItem value="medium">Medium (15px)</SelectItem>
                      <SelectItem value="large">Large (17px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.text_color}
                      onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={form.text_color}
                      onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.accent_color}
                      onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={form.accent_color}
                      onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Footer Text</Label>
                <Textarea
                  className="min-h-[60px]"
                  value={form.footer_text}
                  onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                  placeholder="e.g., Company Inc. — All rights reserved"
                />
              </div>

              <div>
                <Label>Footer Logo URL</Label>
                <Input
                  value={form.footer_logo_url}
                  onChange={(e) => setForm({ ...form, footer_logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Live Preview</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  {showPreview ? "Hide" : "Show"}
                </Button>
              </div>
              {showPreview || true ? (
                <div
                  className="rounded-lg border border-border bg-background p-4 min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.body.trim() || createTemplate.isPending || updateTemplate.isPending}
            >
              {(createTemplate.isPending || updateTemplate.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
