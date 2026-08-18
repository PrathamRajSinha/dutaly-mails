import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KnowledgeBaseSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-3 mb-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-8 rounded-full" />
                <Skeleton className="h-4 w-8 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
