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
import { useQueryClient } from "@tanstack/react-query";

const typeConfig = {
  faq: { icon: MessageSquare, label: "FAQ", color: "bg-green-100 text-green-700" },
  snippet: { icon: FileText, label: "Snippet", color: "bg-purple-100 text-purple-700" },
  document: { icon: File, label: "Document", color: "bg-amber-100 text-amber-700" },
  policy: { icon: FileText, label: "Policy", color: "bg-primary/10 text-primary" },
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"text" | "file">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      // Auto-fill title from filename if empty
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Create unique file path
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("kb-documents")
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload file");
        return;
      }

      // Create the knowledge base entry
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

      if (entryError) {
        console.error("Entry error:", entryError);
        toast.error("Failed to create entry");
        return;
      }

      // Call parse-document to extract text
      const { data: { session } } = await supabase.auth.getSession();
      const parseResponse = await supabase.functions.invoke("parse-document", {
        body: {
          storage_path: fileName,
          file_name: selectedFile.name,
          file_type: fileExt,
          entry_id: entry.id,
        },
      });

      if (parseResponse.error) {
        console.warn("Parse warning:", parseResponse.error);
        // Don't fail the upload if parsing fails
      }

      toast.success("File uploaded and processed");
      setNewEntry({ category: "faq", title: "", content: "", tags: [] });
      setSelectedFile(null);
      setUploadTab("text");
      setIsAddDialogOpen(false);
      
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry.mutateAsync(id);
  };

  const handleEditEntry = (entry: KnowledgeEntry) => {
    setEditingEntry({ ...entry });
    setIsEditDialogOpen(true);
  };

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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="mt-1 text-muted-foreground">
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
                  <Select
                    value={newEntry.category}
                    onValueChange={(v) =>
                      setNewEntry({ ...newEntry, category: v as KnowledgeEntry["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    placeholder="e.g., Pricing Information"
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Enter the information..."
                    rows={5}
                    value={newEntry.content}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, content: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry} disabled={createEntry.isPending}>
                    {createEntry.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Add Entry
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="file" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newEntry.category}
                    onValueChange={(v) =>
                      setNewEntry({ ...newEntry, category: v as KnowledgeEntry["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    placeholder="e.g., Product Documentation"
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Add context about this file..."
                    rows={2}
                    value={newEntry.content}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, content: e.target.value })
                    }
                  />
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, PowerPoint, Text, Images
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={isUploading || !selectedFile || !newEntry.title}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload & Process
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Entries Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEntries.map((entry) => {
          const config = typeConfig[entry.category];
          // Use file type icon if it's a file-based entry
          const FileIcon = entry.file_type ? (fileTypeIcons[entry.file_type] || File) : null;
          const Icon = FileIcon || config?.icon || FileText;

          return (
            <Card
              key={entry.id}
              className="group border border-border transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-lg p-2", config?.color || "bg-muted")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {entry.category}
                    </Badge>
                    {entry.file_name && (
                      <Badge variant="outline" className="text-xs">
                        {entry.file_type?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEntry(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteEntry(entry.id)}
                      disabled={deleteEntry.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-3 text-base">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {entry.content}
                </p>
                {entry.file_name && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <File className="h-3 w-3" />
                    <span className="truncate">{entry.file_name}</span>
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Added {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                <Select
                  value={editingEntry.category}
                  onValueChange={(v) =>
                    setEditingEntry({ ...editingEntry, category: v as KnowledgeEntry["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Input
                  value={editingEntry.title}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  rows={5}
                  value={editingEntry.content}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateEntry.isPending}>
                  {updateEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No entries found
          </h3>
          <p className="mt-1 text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search"
              : "Add your first knowledge entry to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
