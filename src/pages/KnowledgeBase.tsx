import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  MessageSquare,
  File,
  Trash2,
  Edit,
  ChevronDown,
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
import { cn } from "@/lib/utils";

interface KnowledgeEntry {
  id: string;
  type: "text" | "faq" | "document" | "snippet";
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const typeConfig = {
  text: { icon: FileText, label: "Text Entry", color: "bg-primary/10 text-primary" },
  faq: { icon: MessageSquare, label: "FAQ", color: "bg-green-100 text-green-700" },
  document: { icon: File, label: "Document", color: "bg-amber-100 text-amber-700" },
  snippet: { icon: FileText, label: "Snippet", color: "bg-purple-100 text-purple-700" },
};

const initialEntries: KnowledgeEntry[] = [
  {
    id: "1",
    type: "snippet",
    title: "Pricing Information",
    content: "Our pricing starts at ₹9,999/month for the Starter plan. Pro plan is ₹24,999/month and Enterprise is custom pricing.",
    category: "Pricing",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    type: "text",
    title: "Support Hours",
    content: "Support hours are Mon–Fri, 10am–6pm IST. For urgent issues, email urgent@company.com.",
    category: "Support",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    type: "faq",
    title: "Refund Policy",
    content: "We offer full refunds within 7 days of purchase. After 7 days, no refunds are provided. Contact billing@company.com for refund requests.",
    category: "Policies",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    type: "snippet",
    title: "Demo Booking Link",
    content: "Book a demo with our team: https://calendly.com/company/demo",
    category: "Sales",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    type: "document",
    title: "Product Documentation",
    content: "Complete product documentation PDF uploaded. Contains setup guides, API reference, and troubleshooting.",
    category: "Documentation",
    createdAt: "2024-01-10",
  },
];

const categories = ["All", "Pricing", "Support", "Policies", "Sales", "Documentation"];

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: "text" as KnowledgeEntry["type"],
    title: "",
    content: "",
    category: "",
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.content) return;

    const entry: KnowledgeEntry = {
      id: Date.now().toString(),
      type: newEntry.type,
      title: newEntry.title,
      content: newEntry.content,
      category: newEntry.category || "General",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setEntries([entry, ...entries]);
    setNewEntry({ type: "text", title: "", content: "", category: "" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(v) =>
                    setNewEntry({ ...newEntry, type: v as KnowledgeEntry["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Entry</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="snippet">Answer Snippet</SelectItem>
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
                <Label>Category</Label>
                <Input
                  placeholder="e.g., Sales, Support, Policies"
                  value={newEntry.category}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, category: e.target.value })
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry}>Add Entry</Button>
            </DialogFooter>
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
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Entries Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEntries.map((entry) => {
          const config = typeConfig[entry.type];
          const Icon = config.icon;

          return (
            <Card
              key={entry.id}
              className="group border border-border transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-lg p-2", config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {entry.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteEntry(entry.id)}
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
                <p className="mt-3 text-xs text-muted-foreground">
                  Added {entry.createdAt}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
