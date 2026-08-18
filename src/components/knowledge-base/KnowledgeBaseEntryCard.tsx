import { KnowledgeEntry } from "@/hooks/useKnowledgeBase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, MessageSquare, File, Clock, AlertCircle, 
  Copy, Edit, Trash2, ExternalLink, FileType2, 
  FileImage, FileSpreadsheet, Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const typeConfig = {
  faq: { icon: MessageSquare, label: "FAQ", color: "bg-blue-50 text-blue-700 border-blue-200" },
  snippet: { icon: FileText, label: "Snippet", color: "bg-purple-50 text-purple-700 border-purple-200" },
  document: { icon: File, label: "Document", color: "bg-amber-50 text-amber-700 border-amber-200" },
  policy: { icon: FileText, label: "Policy", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const fileTypeIcons: Record<string, any> = {
  pdf: FileType2,
  docx: FileText,
  pptx: FileSpreadsheet,
  image: FileImage,
  txt: FileText,
};

interface KnowledgeBaseEntryCardProps {
  entry: KnowledgeEntry;
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
  selected: boolean;
  onToggleSelection: (id: string) => void;
  isStale?: boolean;
  isDuplicate?: boolean;
}

export function KnowledgeBaseEntryCard({
  entry,
  onEdit,
  onDelete,
  selected,
  onToggleSelection,
  isStale,
  isDuplicate,
}: KnowledgeBaseEntryCardProps) {
  const config = typeConfig[entry.category] || typeConfig.faq;
  const FileIcon = entry.file_type ? (fileTypeIcons[entry.file_type] || File) : null;
  const Icon = FileIcon || config.icon;

  return (
    <Card className={cn(
      "group relative flex flex-col transition-all duration-200 border-slate-200 hover:shadow-md",
      selected && "ring-2 ring-primary border-transparent bg-primary/5 shadow-sm"
    )}>
      <div className="absolute top-3 left-3 z-10">
        <Checkbox 
          checked={selected} 
          onCheckedChange={() => onToggleSelection(entry.id)}
          aria-label={`Select entry: ${entry.title}`}
          className="bg-white"
        />
      </div>

      <CardContent className="p-5 pt-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", config.color.split(' ')[0])}>
              <Icon className={cn("h-4 w-4", config.color.split(' ')[1])} />
            </div>
            <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
              {entry.category}
            </Badge>
          </div>
          
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => onEdit(entry)} aria-label="Edit entry">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive" onClick={() => onDelete(entry.id)} aria-label="Delete entry">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
            {entry.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed min-h-[4.5rem]">
            {entry.content}
          </p>
        </div>

        {(isStale || isDuplicate) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {isStale && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] gap-1 px-1.5">
                      <Clock className="h-3 w-3" /> Stale
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last updated more than 30 days ago</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isDuplicate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1 px-1.5">
                      <Copy className="h-3 w-3" /> Potential Duplicate
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Similar to another entry in your knowledge base</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
            </span>
            {entry.file_name && (
              <span className="flex items-center gap-1 text-primary truncate max-w-[150px]">
                <ExternalLink className="h-3 w-3" />
                {entry.file_name}
              </span>
            )}
          </div>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex -space-x-1">
              {entry.tags.slice(0, 2).map((tag, i) => (
                <div key={i} className="h-5 px-1.5 rounded-full bg-slate-100 border border-white text-[9px] flex items-center">
                  {tag}
                </div>
              ))}
              {entry.tags.length > 2 && (
                <div className="h-5 w-5 rounded-full bg-slate-100 border border-white text-[9px] flex items-center justify-center font-bold">
                  +{entry.tags.length - 2}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
