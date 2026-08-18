import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, ArrowLeft, ChevronRight } from "lucide-react";
import { useEmailTemplates, type EmailTemplate } from "@/hooks/useEmailTemplates";
import { renderEmailHtml } from "@/lib/emailHtml";
import { cn } from "@/lib/utils";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: EmailTemplate) => void;
}

export function TemplatePickerDialog({ open, onOpenChange, onSelect }: TemplatePickerDialogProps) {
  const { templates, isLoading } = useEmailTemplates();
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filtered.map((t) => t.category))];
  const previewTemplate = previewId ? templates.find((t) => t.id === previewId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {previewTemplate ? "Preview Template" : "Select an Email Template"}
          </DialogTitle>
        </DialogHeader>

        {!previewTemplate && (
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search templates by name or category..."
                className="pl-10 bg-white border-slate-200 focus-visible:ring-primary h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {previewTemplate ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewId(null)}
                  className="text-slate-500 hover:text-slate-900 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to list
                </Button>
                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-slate-900">{previewTemplate.name}</p>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest">{previewTemplate.category}</p>
                   </div>
                   <Button onClick={() => { onSelect(previewTemplate); onOpenChange(false); }} className="shadow-sm">
                    Use Template
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <div className="p-8">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderEmailHtml(previewTemplate.body, previewTemplate),
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">
                    No templates found matching your search.
                  </p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                      {cat}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filtered
                        .filter((t) => t.category === cat)
                        .map((t) => (
                          <div
                            key={t.id}
                            className="group flex flex-col justify-between rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 bg-white"
                            onClick={() => setPreviewId(t.id)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{t.name}</p>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {t.body}
                              </p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                               <div className="flex items-center gap-1.5">
                                 <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.accent_color }} />
                                 <span className="text-[10px] font-medium text-slate-400">Accent active</span>
                               </div>
                               <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(t);
                                  onOpenChange(false);
                                }}
                              >
                                SELECT
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
