import { useState, useRef } from "react";
import {
  Plus,
  Search,
  FileText,
  MessageSquare,
  File,
  Trash2,
  Edit,
  Loader2,
  Upload,
  FileImage,
  FileSpreadsheet,
  FileType2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const typeConfig = {
  faq: { icon: MessageSquare, label: "FAQ", color: "bg-[#E6F1FB] text-[#185FA5]", badgeClass: "bg-[#E6F1FB] text-[#185FA5] rounded-full" },
  snippet: { icon: FileText, label: "Snippet", color: "bg-[#EBE9FF] text-[#534AB7]", badgeClass: "bg-[#EBE9FF] text-[#534AB7] rounded-full" },
  document: { icon: File, label: "Document", color: "bg-[#FAEEDA] text-[#854F0B]", badgeClass: "bg-[#FAEEDA] text-[#854F0B] rounded-full" },
  policy: { icon: FileText, label: "Policy", color: "bg-[#E1F5EE] text-[#0F6E56]", badgeClass: "bg-[#E1F5EE] text-[#0F6E56] rounded-full" },
};

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileType2,
  docx: FileText,
  pptx: FileSpreadsheet,
  image: FileImage,
  txt: FileText,
  text: FileText,
};

const categories = ["All", "faq", "snippet", "document", "policy"];

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp";

export default function KnowledgeBase() {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useKnowledgeBase();
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
  const [newEntry, setNewEntry] = useState({
    category: "faq" as KnowledgeEntry["category"],
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        // Fallback: open add dialog pre-filled
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-medium text-[#1A1730]">Knowledge Base</h1>
          <p className="mt-0.5 text-[13px] text-[#9490B8]">
            Add information the AI should use when replying to emails
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
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
                      selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileSelect} className="hidden" />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="secondary" className="text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, Word, PowerPoint, Text, Images</p>
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

      {/* Main Tabs: Entries vs Gaps */}
      <div className="mb-6">
        <div className="flex gap-1 border-b border-border">
          <button
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors",
              mainTab === "entries"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setMainTab("entries")}
          >
            Entries ({entries.length})
          </button>
          <button
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5",
              mainTab === "gaps"
                ? "border-b-2 border-[#BA7517] text-[#BA7517]"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setMainTab("gaps")}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#EF9F27]" />
            Gaps Detected
            {totalGaps > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-[#FAEEDA] text-[#854F0B] border-none">
                {totalGaps}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {mainTab === "entries" ? (
        <>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search knowledge base..." className="pl-10 border-[rgba(124,111,224,0.2)] focus-visible:ring-primary focus-visible:border-primary" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="capitalize">
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Entries Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => {
              const config = typeConfig[entry.category];
              const FileIcon = entry.file_type ? (fileTypeIcons[entry.file_type] || File) : null;
              const Icon = FileIcon || config?.icon || FileText;
              return (
                <Card key={entry.id} className="group border border-[rgba(124,111,224,0.1)] transition-all hover:border-[rgba(124,111,224,0.3)] hover:bg-[#FDFCFF]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("rounded-lg p-2", config?.color || "bg-muted")}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge className={cn("text-xs capitalize border-none", config?.badgeClass)}>{entry.category}</Badge>
                        {entry.file_name && <Badge variant="outline" className="text-xs">{entry.file_type?.toUpperCase()}</Badge>}
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEntry(entry.id)} disabled={deleteEntry.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-base">{entry.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{entry.content}</p>
                    {entry.file_name && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <File className="h-3 w-3" />
                        <span className="truncate">{entry.file_name}</span>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">Added {new Date(entry.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No entries found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Add your first knowledge entry to get started"}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Gaps Detected Tab */
        <div className="space-y-4">
          {totalGaps > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">
                  <strong>Resolving these gaps could auto-handle ~{Math.round(totalGaps * 1.5)} more emails per month.</strong>{" "}
                  Add KB entries for the topics below to improve your AI's resolution rate.
                </p>
              </CardContent>
            </Card>
          )}

          {gapGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No gaps detected</h3>
              <p className="mt-1 text-muted-foreground">
                Your knowledge base is covering all escalated topics. Great job!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gapGroups.map((gap) => (
                <Card key={gap.detected_topic} className="border border-border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {gap.count} escalated
                        </Badge>
                        {gap.category && (
                          <Badge variant="outline" className="text-xs capitalize shrink-0">
                            {gap.category.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {gap.count} escalated email{gap.count !== 1 ? "s" : ""} about: <span className="text-primary">{gap.detected_topic}</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateFromGap(gap)}
                      disabled={generatingTopic === gap.detected_topic || resolveGaps.isPending}
                    >
                      {generatingTopic === gap.detected_topic ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Generate Entry
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Entry</DialogTitle>
            <DialogDescription>Update this knowledge base entry.</DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
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
                <Textarea rows={5} value={editingEntry.content} onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={updateEntry.isPending}>
                  {updateEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
