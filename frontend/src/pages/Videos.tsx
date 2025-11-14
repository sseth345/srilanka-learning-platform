import { useState, useEffect, useMemo, useCallback } from "react";
import { Play, Clock, Eye, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuthToken } from "@/hooks/useAuthToken";
import { VideoUploadDialog } from "@/components/VideoUploadDialog";
import { VideoPlayerDialog } from "@/components/VideoPlayerDialog";
import { getApiEndpoint } from "@/config/api";

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  streamingUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string | Date;
}

const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const Videos = () => {
  const { userProfile } = useAuth();
  const { getAuthHeaders } = useAuthToken();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isTeacher = userProfile?.role === "teacher";

  const fetchVideos = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();

      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `${getApiEndpoint('/videos')}?${params}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Rate limit exceeded, retrying later...");
          return;
        }
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(
        data.map((video: any) => ({
          ...video,
          createdAt: video.createdAt ? new Date(video.createdAt) : new Date(),
        }))
      );
    } catch (error) {
      console.error("Error fetching videos:", error);
      // Don't spam toasts on network errors
    }
  }, [selectedCategory, searchTerm, getAuthHeaders]);

  useEffect(() => {
    setLoading(true);
    fetchVideos().finally(() => setLoading(false));
  }, [fetchVideos]);

  const handleSearch = () => {
    setLoading(true);
    fetchVideos().finally(() => setLoading(false));
  };

  const handlePlayVideo = async (video: Video) => {
    try {
      // Use existing streamingUrl as fallback
      let streamingUrl = video.streamingUrl;

      // Try to get updated streamingUrl from backend (optional - for view tracking)
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          getApiEndpoint(`/videos/${video.id}/view`),
          {
            method: "POST",
            headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          streamingUrl = data.streamingUrl || video.streamingUrl;
        } else {
          // If backend fails, still use existing URL
          console.warn("Failed to update view count, using existing streaming URL");
        }
      } catch (apiError) {
        // If API call fails, still use existing URL
        console.warn("Error calling view endpoint, using existing streaming URL:", apiError);
      }

      // Validate streamingUrl exists
      if (!streamingUrl) {
        toast.error("Video streaming URL is missing. Please contact support.");
        return;
      }

      setSelectedVideo({ ...video, streamingUrl });
      setPlayerOpen(true);

      // Refresh video list in background (don't wait for it)
      fetchVideos().catch((error) => console.error("Error refreshing videos:", error));
    } catch (error) {
      console.error("Error playing video:", error);
      toast.error("Failed to start video. Please try again.");
    }
  };

  const confirmDelete = (videoId: string) => {
    setVideoToDelete(videoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      setDeleting(true);
      const headers = await getAuthHeaders();

      const response = await fetch(
        getApiEndpoint(`/videos/${videoToDelete}`),
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      toast.success("Video deleted successfully");
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      fetchVideos().catch((error) => console.error(error));
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  const categories = useMemo(
    () => ["all", ...new Set(videos.map((video) => video.category).filter(Boolean))],
    [videos]
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Lectures</h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Upload and manage your lecture recordings"
              : "Stream recorded lectures anytime"}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        )}
      </div>

      <Card className="shadow-elevated border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading videos...</p>
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card className="shadow-elevated border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold mb-2">No videos available</p>
            <p className="text-sm text-muted-foreground max-w-md">
              {isTeacher
                ? "Upload your first lecture video to get started"
                : "No lecture videos have been shared yet"}
            </p>
            {isTeacher && (
              <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                Upload Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="shadow-elevated hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 hover:border-primary/20 group"
            >
              <div
                className="relative h-56 bg-muted cursor-pointer overflow-hidden rounded-t-lg"
                onClick={() => handlePlayVideo(video)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect fill="%23ddd" width="640" height="360"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Thumbnail%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary rounded-full p-5 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
                <Badge className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white border-0 shadow-lg">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDuration(video.duration)}
                </Badge>
              </div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-secondary">{video.category}</Badge>
                <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {video.uploadedByName}
                </p>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {(video.views || 0).toLocaleString()}
                  </span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="gradient" size="sm" onClick={() => handlePlayVideo(video)}>
                    <Play className="mr-2 h-4 w-4" />
                    Watch
                  </Button>
                  {isTeacher && video.uploadedBy === userProfile?.uid && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={() => {
          setLoading(true);
          fetchVideos().finally(() => setLoading(false));
        }}
      />

      <VideoPlayerDialog
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        video={selectedVideo}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the video from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
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

export default Videos;
