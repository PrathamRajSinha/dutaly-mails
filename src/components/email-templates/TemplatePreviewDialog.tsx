import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderEmailHtml, replaceVariables } from "@/lib/emailHtml";
import { EmailTemplateInput } from "@/hooks/useEmailTemplates";
import { Info, Eye } from "lucide-react";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplateInput;
}

const sampleVars = {
  sender_name: "Jane Doe",
  subject: "Inquiry about product features",
  my_name: "John Support",
};

export function TemplatePreviewDialog({ open, onOpenChange, template }: TemplatePreviewDialogProps) {
  const processedBody = replaceVariables(template.body, sampleVars);
  const previewHtml = renderEmailHtml(processedBody, {
    accent_color: template.accent_color,
    footer_text: template.footer_text,
    footer_logo_url: template.footer_logo_url,
    font_family: template.font_family,
    font_size: template.font_size,
    text_color: template.text_color,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <DialogTitle>Template Preview Test</DialogTitle>
          </div>
          <DialogDescription>
            This shows how your email will look to a recipient. 
            <span className="block mt-1 font-semibold text-orange-600 flex items-center gap-1">
              <Info className="h-3 w-3" /> This is a preview only. No email will be sent.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 w-full mb-1">Sample Data Used:</span>
            {Object.entries(sampleVars).map(([key, val]) => (
              <Badge key={key} variant="secondary" className="text-[10px]">
                {key}: {val}
              </Badge>
            ))}
          </div>

          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
              <div className="text-[11px] text-slate-400">Subject:</div>
              <div className="text-sm font-medium">{sampleVars.subject}</div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[400px]">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
