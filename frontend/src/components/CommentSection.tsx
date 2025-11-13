import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Trash2,
  Edit,
  Loader2,
  Send,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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

interface CommentSectionProps {
  discussionId: string;
  comments: Comment[];
  isLocked: boolean;
  onRefresh: () => void;
}

interface CommentItemProps {
  comment: Comment;
  discussionId: string;
  isLocked: boolean;
  onRefresh: () => void;
  depth?: number;
}

const CommentItem = ({
  comment,
  discussionId,
  isLocked,
  onRefresh,
  depth = 0,
}: CommentItemProps) => {
  const { userProfile, getIdToken } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isAuthor = userProfile?.uid === comment.authorId;
  const isTeacher = userProfile?.role === "teacher";
  const hasLiked = comment.likedBy?.includes(userProfile?.uid || "");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsReplying(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            discussionId,
            content: replyContent,
            parentId: comment.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      toast.success("Reply posted!");
      setReplyContent("");
      setShowReplyBox(false);
      onRefresh();
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsUpdating(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments/${comment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: editContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      toast.success("Comment updated!");
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments/${comment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      toast.success("Comment deleted!");
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    setIsLiking(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments/${comment.id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }

      onRefresh();
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Failed to like comment");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(comment.authorName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.authorName}</span>
            {comment.authorRole === "teacher" && (
              <Badge variant="default" className="text-xs h-5">
                Teacher
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
                disabled={isUpdating}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 text-xs", hasLiked && "text-red-500")}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn("h-3 w-3 mr-1", hasLiked && "fill-current")} />
              {comment.likesCount || 0}
            </Button>

            {!isLocked && depth < 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyBox(!showReplyBox)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {(isAuthor || isTeacher) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthor && !isEditing && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {showReplyBox && !isLocked && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
                disabled={isReplying}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isReplying || !replyContent.trim()}
                >
                  {isReplying ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3" />
                      Post Reply
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent("");
                  }}
                  disabled={isReplying}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4 mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              discussionId={discussionId}
              isLocked={isLocked}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this comment and all its replies. This action
              cannot be undone.
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

export const CommentSection = ({
  discussionId,
  comments,
  isLocked,
  onRefresh,
}: CommentSectionProps) => {
  const { getIdToken } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsPosting(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            discussionId,
            content: newComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      toast.success("Comment posted!");
      setNewComment("");
      onRefresh();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">
        Comments ({comments.length})
      </h3>

      {/* New Comment Box */}
      {!isLocked && (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            disabled={isPosting}
          />
          <Button
            onClick={handlePostComment}
            disabled={isPosting || !newComment.trim()}
          >
            {isPosting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      )}

      {isLocked && (
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            This discussion is locked. No new comments can be added.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              discussionId={discussionId}
              isLocked={isLocked}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
};

