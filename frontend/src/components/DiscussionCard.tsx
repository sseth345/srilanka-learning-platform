import { Heart, MessageCircle, Eye, Pin, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  likesCount: number;
  commentsCount: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onClick: () => void;
}

export const DiscussionCard = ({ discussion, onClick }: DiscussionCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return role === "teacher" ? "text-primary" : "text-muted-foreground";
  };

  const getRoleBadge = (role: string) => {
    if (role === "teacher") {
      return (
        <Badge variant="default" className="text-xs">
          Teacher
        </Badge>
      );
    }
    return null;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <Card
      className={cn(
        "shadow-elevated hover:shadow-glow transition-all duration-300 cursor-pointer",
        discussion.isPinned && "border-primary border-2"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={discussion.authorAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(discussion.authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("font-semibold", getRoleColor(discussion.authorRole))}>
                  {discussion.authorName}
                </span>
                {getRoleBadge(discussion.authorRole)}
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(discussion.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {discussion.category}
                </Badge>
                {discussion.isPinned && (
                  <Badge variant="default" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {discussion.isLocked && (
                  <Badge variant="destructive" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{discussion.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {truncateContent(discussion.content)}
        </p>

        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {discussion.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {discussion.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{discussion.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{discussion.likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.commentsCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{discussion.views || 0}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

