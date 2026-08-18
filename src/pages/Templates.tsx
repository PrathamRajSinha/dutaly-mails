import { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TemplateEditor } from "@/components/email-templates/TemplateEditor";
import { TemplatePreviewDialog } from "@/components/email-templates/TemplatePreviewDialog";
import { cn } from "@/lib/utils";

const defaultTemplate: EmailTemplateInput = {
  name: "",
  category: "general",
  body: "",
  accent_color: "#4F46E5",
  footer_text: "",
  footer_logo_url: "",
  font_family: "sans-serif",
  font_size: "medium",
  text_color: "#374151",
};

export default function Templates() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmailTemplateInput>(defaultTemplate);
  const [testPreviewOpen, setTestPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category));
    return ["All", ...Array.from(cats)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultTemplate);
    setDialogOpen(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      category: t.category,
      body: t.body,
      accent_color: t.accent_color,
      footer_text: t.footer_text,
      footer_logo_url: t.footer_logo_url,
      font_family: t.font_family,
      font_size: t.font_size,
      text_color: t.text_color,
    });
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Templates</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            Create and manage professional email templates for your outgoing messages.
          </p>
        </div>
        <Button onClick={openCreate} className="shadow-sm hover:shadow-md transition-shadow">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 border-slate-200 focus-visible:ring-primary h-10" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-100 mr-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Category:</span>
          </div>
          {categories.map((cat) => (
            <Button 
              key={cat} 
              variant={selectedCategory === cat ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setSelectedCategory(cat)} 
              className={cn(
                "capitalize text-xs rounded-full h-8 px-4",
                selectedCategory !== cat && "text-slate-500 hover:bg-slate-100"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {searchQuery || selectedCategory !== "All" ? "No templates match your filters" : "No templates yet"}
          </h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            {searchQuery || selectedCategory !== "All" 
              ? "Try adjusting your search terms or category selection." 
              : "Create your first email template to speed up your communication."}
          </p>
          <Button className="mt-6" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t) => (
            <Card key={t.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200">
              <CardContent className="p-6 space-y-4 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{t.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-[10px] capitalize bg-slate-100 text-slate-600 border-none">
                      {t.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => openEdit(t)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-destructive"
                      onClick={() => { setDeleteId(t.id); setDeleteDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                  {t.body}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <div className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: t.accent_color }} />
                    <span>Branding Active</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[11px] font-bold text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => {
                      setForm(t);
                      setTestPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Quick Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">{editingId ? "Edit Email Template" : "Create Email Template"}</DialogTitle>
                <DialogDescription className="mt-1">
                  Design a professional template with variables and custom branding.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                 <Button 
                  variant="outline" 
                  onClick={() => setTestPreviewOpen(true)}
                  className="hidden sm:flex border-slate-200 hover:bg-slate-50"
                 >
                  <Eye className="mr-2 h-4 w-4 text-slate-500" />
                  Preview Test
                </Button>
                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.body.trim() || createTemplate.isPending || updateTemplate.isPending}
                  className="px-8 shadow-sm"
                >
                  {(createTemplate.isPending || updateTemplate.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Save Changes" : "Create Template"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-6 bg-white">
            <TemplateEditor form={form} setForm={setForm} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Test Dialog */}
      <TemplatePreviewDialog 
        open={testPreviewOpen} 
        onOpenChange={setTestPreviewOpen} 
        template={form} 
      />

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
