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
import { Search, FileText } from "lucide-react";
import { useEmailTemplates, type EmailTemplate } from "@/hooks/useEmailTemplates";
import { renderEmailHtml } from "@/lib/emailHtml";

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {previewTemplate ? (
          <div className="flex-1 overflow-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{previewTemplate.name}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewId(null)}>
                  Back
                </Button>
                <Button size="sm" onClick={() => { onSelect(previewTemplate); onOpenChange(false); }}>
                  Use Template
                </Button>
              </div>
            </div>
            <div
              className="rounded-lg border border-border p-4 bg-background"
              dangerouslySetInnerHTML={{
                __html: renderEmailHtml(previewTemplate.body, previewTemplate),
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading templates...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No templates found. Create one from the Templates page.
              </p>
            ) : (
              categories.map((cat) => (
                <div key={cat}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {cat}
                  </h4>
                  <div className="space-y-2">
                    {filtered
                      .filter((t) => t.category === cat)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => setPreviewId(t.id)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {t.body.slice(0, 80)}...
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(t);
                              onOpenChange(false);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
