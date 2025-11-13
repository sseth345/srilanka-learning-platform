import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Eye,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CommentSection } from "@/components/CommentSection";
import { cn } from "@/lib/utils";

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
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  likedBy: string[];
}

interface Comment {
  id: string;
  discussionId: string;
  content: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  likedBy: string[];
  isEdited?: boolean;
  replies?: Comment[];
}

interface DiscussionDetailProps {
  discussionId: string;
  onBack: () => void;
  onDelete: () => void;
}

export const DiscussionDetail = ({
  discussionId,
  onBack,
  onDelete,
}: DiscussionDetailProps) => {
  const { userProfile, getIdToken } = useAuth();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = userProfile?.uid === discussion?.authorId;
  const isTeacher = userProfile?.role === "teacher";
  const hasLiked = discussion?.likedBy?.includes(userProfile?.uid || "");

  const fetchDiscussion = async () => {
    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/${discussionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch discussion");
      }

      const data = await response.json();
      setDiscussion({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch (error) {
      console.error("Error fetching discussion:", error);
      toast.error("Failed to load discussion");
    }
  };

  const fetchComments = async () => {
    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments/discussion/${discussionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(
        data.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
          replies: comment.replies?.map((reply: any) => ({
            ...reply,
            createdAt: new Date(reply.createdAt),
            updatedAt: new Date(reply.updatedAt),
          })),
        }))
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDiscussion(), fetchComments()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [discussionId]);

  const handleLike = async () => {
    if (!discussion) return;

    setIsLiking(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/${discussion.id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like discussion");
      }

      await fetchDiscussion();
    } catch (error) {
      console.error("Error liking discussion:", error);
      toast.error("Failed to like discussion");
    } finally {
      setIsLiking(false);
    }
  };

  const handlePin = async () => {
    if (!discussion) return;

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/${discussion.id}/pin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pinned: !discussion.isPinned,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to pin discussion");
      }

      toast.success(discussion.isPinned ? "Discussion unpinned" : "Discussion pinned");
      await fetchDiscussion();
    } catch (error) {
      console.error("Error pinning discussion:", error);
      toast.error("Failed to pin discussion");
    }
  };

  const handleLock = async () => {
    if (!discussion) return;

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/${discussion.id}/lock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            locked: !discussion.isLocked,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to lock discussion");
      }

      toast.success(discussion.isLocked ? "Discussion unlocked" : "Discussion locked");
      await fetchDiscussion();
    } catch (error) {
      console.error("Error locking discussion:", error);
      toast.error("Failed to lock discussion");
    }
  };

  const handleDelete = async () => {
    if (!discussion) return;

    setIsDeleting(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/discussions/${discussion.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete discussion");
      }

      toast.success("Discussion deleted");
      setDeleteDialogOpen(false);
      onDelete();
    } catch (error) {
      console.error("Error deleting discussion:", error);
      toast.error("Failed to delete discussion");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Discussion not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discussions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discussions
      </Button>

      {/* Discussion Card */}
      <Card className="shadow-elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={discussion.authorAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(discussion.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{discussion.authorName}</span>
                  {discussion.authorRole === "teacher" && (
                    <Badge variant="default">Teacher</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(discussion.createdAt)}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary">{discussion.category}</Badge>
                  {discussion.isPinned && (
                    <Badge variant="default">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {discussion.isLocked && (
                    <Badge variant="destructive">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {(isAuthor || isTeacher) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isTeacher && (
                    <>
                      <DropdownMenuItem onClick={handlePin}>
                        <Pin className="h-4 w-4 mr-2" />
                        {discussion.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLock}>
                        {discussion.isLocked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  {(isAuthor || isTeacher) && (
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
            <p className="text-base whitespace-pre-wrap">{discussion.content}</p>
          </div>

          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={cn(hasLiked && "text-red-500")}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn("h-4 w-4 mr-2", hasLiked && "fill-current")} />
              {discussion.likesCount || 0} Likes
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {discussion.commentsCount || 0} Comments
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {discussion.views || 0} Views
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-elevated">
        <CardContent className="pt-6">
          <CommentSection
            discussionId={discussion.id}
            comments={comments}
            isLocked={discussion.isLocked}
            onRefresh={fetchComments}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discussion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this discussion and all its comments. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

