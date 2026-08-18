import { History, Bookmark, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RecentQuestionsProps {
  recent: string[];
  saved: string[];
  onSelect: (question: string) => void;
  onSave: (question: string) => void;
  onClearRecent: () => void;
  onRemoveSaved: (question: string) => void;
}

export function RecentQuestions({
  recent,
  saved,
  onSelect,
  onClearRecent,
  onRemoveSaved,
}: RecentQuestionsProps) {
  if (recent.length === 0 && saved.length === 0) return null;

  return (
    <div className="w-full lg:w-72 shrink-0 space-y-4">
      {saved.length > 0 && (
        <Card className="border-[rgba(124,111,224,0.1)]">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-[#7C6FE0]" />
              Saved Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-col gap-1">
              {saved.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(q)}
                  className="group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-[#F4F3FF]"
                >
                  <span className="truncate text-[#3D3A5C] group-hover:text-[#7C6FE0]">
                    {q}
                  </span>
                  <Trash2 
                    className="h-3.5 w-3.5 text-[#9490B8] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSaved(q);
                    }}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recent.length > 0 && (
        <Card className="border-[rgba(124,111,224,0.1)]">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-[#7C6FE0]" />
              Recent
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearRecent}
              className="h-6 px-2 text-[10px] text-[#9490B8] hover:text-red-500"
            >
              Clear
            </Button>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-col gap-1">
              {recent.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(q)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-[#F4F3FF] group"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#C4BEFF] shrink-0" />
                  <span className="truncate text-[#3D3A5C] group-hover:text-[#7C6FE0]">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
