import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CreateDiscussionDialog } from "@/components/CreateDiscussionDialog";
import { DiscussionCard } from "@/components/DiscussionCard";
import { DiscussionDetail } from "@/components/DiscussionDetail";

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
}

const Discussions = () => {
  const { getIdToken } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      params.append("sort", sortBy);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const data = await response.json();
      const formattedDiscussions = data.map((discussion: any) => ({
        ...discussion,
        createdAt: new Date(discussion.createdAt),
      }));

      // Sort pinned discussions to the top
      formattedDiscussions.sort((a: Discussion, b: Discussion) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

      setDiscussions(formattedDiscussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast.error("Failed to load discussions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/meta/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(["all", ...data]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, sortBy]);

  const handleSearch = () => {
    fetchDiscussions();
  };

  const handleDiscussionClick = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
  };

  const handleBackToList = () => {
    setSelectedDiscussionId(null);
    fetchDiscussions();
  };

  const handleDeleteSuccess = () => {
    setSelectedDiscussionId(null);
    fetchDiscussions();
  };

  // If a discussion is selected, show the detail view
  if (selectedDiscussionId) {
    return (
      <DiscussionDetail
        discussionId={selectedDiscussionId}
        onBack={handleBackToList}
        onDelete={handleDeleteSuccess}
      />
    );
  }

  // Otherwise, show the list view
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discussion Forum</h1>
          <p className="text-muted-foreground">
            Ask questions, share ideas, and discuss with the community
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-elevated">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Sort Tabs */}
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="recent" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="popular" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Active
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search and Category Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search discussions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} variant="default">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Computer Science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="Homework Help">Homework Help</SelectItem>
                      <SelectItem value="Study Tips">Study Tips</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : discussions.length === 0 ? (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No discussions found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to start a discussion!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => handleDiscussionClick(discussion.id)}
            />
          ))}
        </div>
      )}

      {/* Create Discussion Dialog */}
      <CreateDiscussionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchDiscussions}
      />
    </div>
  );
};

export default Discussions;
