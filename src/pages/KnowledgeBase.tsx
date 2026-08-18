import { useState, useRef, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useKnowledgeBase, type KnowledgeEntry } from "@/hooks/useKnowledgeBase";
import { useKbGaps, type GroupedGap } from "@/hooks/useKbGaps";
import { useQueryClient } from "@tanstack/react-query";
import { KnowledgeBaseEntryCard } from "@/components/knowledge-base/KnowledgeBaseEntryCard";
import { KnowledgeBaseSkeleton } from "@/components/knowledge-base/KnowledgeBaseSkeleton";
import { BulkActionBar } from "@/components/knowledge-base/BulkActionBar";
import { differenceInDays } from "date-fns";

const categories = ["All", "faq", "snippet", "document", "policy"];
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp";

// Helper for similarity detection
function getSimilarity(s1: string, s2: string) {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const words1 = new Set(normalize(s1));
  const words2 = new Set(normalize(s2));
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

export default function KnowledgeBase() {
  const { entries, isLoading, error, createEntry, updateEntry, deleteEntry } = useKnowledgeBase();
  const { grouped: gapGroups, totalGaps, resolveGaps } = useKbGaps();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"text" | "file">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mainTab, setMainTab] = useState<"entries" | "gaps">("entries");
  const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [newEntry, setNewEntry] = useState({
    category: "faq" as KnowledgeEntry["category"],
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, selectedCategory]);

  // Derived hints
  const entryHints = useMemo(() => {
    const hints: Record<string, { stale: boolean; duplicate: boolean }> = {};
    const now = new Date();

    entries.forEach((entry, idx) => {
      const stale = differenceInDays(now, new Date(entry.updated_at)) > 30;
      let duplicate = false;
      
      // Compare with other entries for duplicates
      for (let i = 0; i < entries.length; i++) {
        if (i === idx) continue;
        const similarity = getSimilarity(entry.title, entries[i].title);
        if (similarity > 0.7) {
          duplicate = true;
          break;
        }
      }
      
      hints[entry.id] = { stale, duplicate };
    });
    return hints;
  }, [entries]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      for (const id of idsToDelete) {
        await deleteEntry.mutateAsync(id);
      }
      setSelectedIds(new Set());
      toast.success(`Deleted ${idsToDelete.length} entries`);
    } catch (error) {
      toast.error("Failed to delete some entries");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.title || !newEntry.content) return;
    await createEntry.mutateAsync({
      category: newEntry.category,
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags,
      storage_path: null,
      file_type: null,
      file_name: null,
      extracted_text: null,
    });
    setNewEntry({ category: "faq", title: "", content: "", tags: [] });
    setSelectedFile(null);
    setUploadTab("text");
    setIsAddDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newEntry.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewEntry(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !newEntry.title) {
      toast.error("Please provide a title and select a file");
      return;
    }
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not authenticated"); return; }
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage.from("kb-documents").upload(fileName, selectedFile);
      if (uploadError) { toast.error("Failed to upload file"); return; }
      const { data: entry, error: entryError } = await supabase
        .from("knowledge_base_entries")
        .insert({
          user_id: user.id,
          category: newEntry.category,
          title: newEntry.title,
          content: newEntry.content || `Uploaded file: ${selectedFile.name}`,
          tags: newEntry.tags,
          storage_path: fileName,
          file_name: selectedFile.name,
          file_type: fileExt || "unknown",
        })
        .select()
        .single();
      if (entryError) { toast.error("Failed to create entry"); return; }
      await supabase.functions.invoke("parse-document", {
        body: { storage_path: fileName, file_name: selectedFile.name, file_type: fileExt, entry_id: entry.id },
      });
      toast.success("File uploaded and processed");
      setNewEntry({ category: "faq", title: "", content: "", tags: [] });
      setSelectedFile(null);
      setUploadTab("text");
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => { await deleteEntry.mutateAsync(id); };
  const handleEditEntry = (entry: KnowledgeEntry) => { setEditingEntry({ ...entry }); setIsEditDialogOpen(true); };
  const handleSaveEdit = async () => {
    if (!editingEntry || !editingEntry.title || !editingEntry.content) return;
    await updateEntry.mutateAsync({
      id: editingEntry.id,
      title: editingEntry.title,
      content: editingEntry.content,
      category: editingEntry.category,
      tags: editingEntry.tags,
    });
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleGenerateFromGap = async (gap: GroupedGap) => {
    setGeneratingTopic(gap.detected_topic);
    try {
      const response = await supabase.functions.invoke("generate-kb-from-url", {
        body: { topic: gap.detected_topic, category: gap.category },
      });
      if (response.error) throw response.error;
      const generated = response.data?.entries?.[0];
      if (generated) {
        await createEntry.mutateAsync({
          category: "faq",
          title: generated.title || gap.detected_topic,
          content: generated.content || `Information about ${gap.detected_topic}`,
          tags: [],
          storage_path: null,
          file_type: null,
          file_name: null,
          extracted_text: null,
        });
        await resolveGaps.mutateAsync(gap.ids);
        toast.success("KB entry created and gap resolved");
      } else {
        setNewEntry({
          category: "faq",
          title: gap.detected_topic,
          content: "",
          tags: [],
        });
        setIsAddDialogOpen(true);
        toast.info("Could not auto-generate. Please write the entry manually.");
      }
    } catch {
      setNewEntry({
        category: "faq",
        title: gap.detected_topic,
        content: "",
        tags: [],
      });
      setIsAddDialogOpen(true);
      toast.info("Auto-generation unavailable. Please write the entry manually.");
    } finally {
      setGeneratingTopic(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            The source of truth for your AI. Add FAQs, documents, and policies to help the AI provide accurate responses.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm hover:shadow-md transition-shadow">
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Knowledge Entry</DialogTitle>
              <DialogDescription>
                Add information that the AI can use to answer emails.
              </DialogDescription>
            </DialogHeader>
            <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "text" | "file")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Entry</TabsTrigger>
                <TabsTrigger value="file">Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v as KnowledgeEntry["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="snippet">Answer Snippet</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g., Pricing Information" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea placeholder="Enter the information..." rows={5} value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEntry} disabled={createEntry.isPending}>
                    {createEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Entry
                  </Button>
                </DialogFooter>
              </TabsContent>
              <TabsContent value="file" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v as KnowledgeEntry["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="snippet">Answer Snippet</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g., Product Documentation" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea placeholder="Add context about this file..." rows={2} value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      selectedFile ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileSelect} className="hidden" />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="secondary" className="text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, Word, PowerPoint, Text, Images</p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleFileUpload} disabled={isUploading || !selectedFile || !newEntry.title}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload & Process
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Tabs */}
      <div className="mb-6">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "entries" | "gaps")}>
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="entries" className="px-6">
              Entries ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="gaps" className="px-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Gaps Detected
              {totalGaps > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-orange-100 text-orange-700 border-none ml-1">
                  {totalGaps}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mainTab === "entries" ? (
        <>
          {/* Filters & Search */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search knowledge by title or content..." 
                className="pl-10 border-slate-200 focus-visible:ring-primary h-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 pr-2 border-r border-slate-100 mr-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filter by type:</span>
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

          {isLoading ? (
            <KnowledgeBaseSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Failed to load knowledge base</h3>
              <p className="text-slate-500 mt-2">There was an error fetching your data. Please try again.</p>
              <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {searchQuery ? "No entries found matching your search" : "Your knowledge base is empty"}
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm">
                {searchQuery ? "Try adjusting your filters or search terms." : "Start by adding common questions, snippets, or documents that your AI can learn from."}
              </p>
              {!searchQuery && (
                <Button className="mt-6" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry) => (
                <KnowledgeBaseEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  selected={selectedIds.has(entry.id)}
                  onToggleSelection={toggleSelection}
                  isStale={entryHints[entry.id]?.stale}
                  isDuplicate={entryHints[entry.id]?.duplicate}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Gaps View remains similar but styled */
        <div className="space-y-6">
          {gapGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No knowledge gaps detected</h3>
              <p className="text-slate-500 mt-2">The AI has all the information it needs for recent tickets!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {gapGroups.map((group) => (
                <Card key={group.detected_topic} className="overflow-hidden border-slate-200">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{group.detected_topic}</h3>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-none">
                            {group.count} occurrences
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm">{group.category ?? "Uncategorised topic"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleGenerateFromGap(group)} 
                          disabled={generatingTopic === group.detected_topic}
                          className="bg-slate-900 text-white hover:bg-slate-800"
                        >
                          {generatingTopic === group.detected_topic ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Generate Entry
                        </Button>
                        <Button variant="outline" onClick={() => resolveGaps.mutate(group.ids)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
        isDeleting={isDeletingBulk}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editingEntry.category} onValueChange={(v) => setEditingEntry({ ...editingEntry, category: v as KnowledgeEntry["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="snippet">Answer Snippet</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editingEntry.title} onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={8} value={editingEntry.content} onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateEntry.isPending}>
              {updateEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
