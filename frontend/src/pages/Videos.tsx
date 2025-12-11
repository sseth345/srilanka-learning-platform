// src/pages/Videos.tsx
import React, { useState, useEffect, useMemo } from "react";
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

const PAGE_SIZE = 20;

/* ------------------ utility ------------------ */
const formatDuration = (seconds?: number) => {
  if (!seconds && seconds !== 0) return "00:00";
  const mins = Math.floor((seconds || 0) / 60);
  const secs = Math.floor((seconds || 0) % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const Videos: React.FC = () => {
  const { userProfile } = useAuth();
  const { getAuthHeaders } = useAuthToken();
  const isTeacher = userProfile?.role === "teacher";

  /* ------------------ DATA ------------------ */
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [displayVideos, setDisplayVideos] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  /* ------------------ UI ------------------ */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ------------------ LOAD ALL VIDEOS ONCE ------------------ */
  const loadVideosOnce = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await fetch(getApiEndpoint("/videos"), {
        method: "GET",
        headers,
      });

      if (!res.ok) throw new Error("Failed to fetch videos");

      const json = await res.json();
      setAllVideos(json);
      setDisplayVideos(json.slice(0, PAGE_SIZE));
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load videos");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideosOnce(); // ⭐ ONLY ONE REQUEST
  }, []);

  /* ------------------ LOCAL FILTERING ------------------ */
  const filteredVideos = useMemo(() => {
    let arr = [...allVideos];

    if (selectedCategory !== "all") {
      arr = arr.filter((v) => v.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      arr = arr.filter((v) =>
        [v.title, v.description, v.category, v.uploadedByName]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(s))
      );
    }

    return arr;
  }, [allVideos, searchTerm, selectedCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setDisplayVideos(filteredVideos.slice(0, PAGE_SIZE));
  }, [filteredVideos]);

  /* ------------------ LOAD MORE (LOCAL ONLY) ------------------ */
  const loadMore = () => {
    const newCount = visibleCount + PAGE_SIZE;
    setVisibleCount(newCount);
    setDisplayVideos(filteredVideos.slice(0, newCount));
  };

  const hasMore = visibleCount < filteredVideos.length;

  /* ------------------ PLAY ------------------ */
  const handlePlayVideo = async (video: any) => {
    try {
      const headers = await getAuthHeaders();
      let url = video.streamingUrl;

      const res = await fetch(getApiEndpoint(`/videos/${video.id}/view`), {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        url = data.streamingUrl || url;
      }

      setSelectedVideo({ ...video, streamingUrl: url });
      setPlayerOpen(true);
    } catch {
      toast.error("Failed to load video");
    }
  };

  /* ------------------ DELETE ------------------ */
  const confirmDelete = (id: string) => {
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    setDeleting(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(getApiEndpoint(`/videos/${videoToDelete}`), {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Video deleted");
      setAllVideos((prev) => prev.filter((v) => v.id !== videoToDelete));
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    } catch {
      toast.error("Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------ CATEGORIES ------------------ */
  const categories = useMemo(() => {
    const set = new Set<string>();
    allVideos.forEach((v) => v.category && set.add(v.category));
    return ["all", ...Array.from(set)];
  }, [allVideos]);

  /* ------------------ UI ------------------ */
  return (
    <div className="space-y-6 animate-in">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Lectures</h1>
          <p className="text-muted-foreground">
            {isTeacher ? "Upload and manage your lecture recordings" : "Stream recorded lectures anytime"}
          </p>
        </div>

        {isTeacher && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload Video
          </Button>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <Card className="shadow-elevated border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LOADING */}
      {loading && (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center py-16">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Loading videos...</p>
          </CardContent>
        </Card>
      )}

      {/* NO VIDEOS */}
      {!loading && displayVideos.length === 0 && (
        <Card className="shadow-elevated border-2">
          <CardContent className="flex flex-col items-center py-16">
            <Play className="h-10 w-10 mb-4 text-muted" />
            No videos found
          </CardContent>
        </Card>
      )}

      {/* GRID */}
      {!loading && displayVideos.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayVideos.map((video) => (
              <Card key={video.id} className="shadow-elevated hover:shadow-xl transition-all border-2">
                <div className="relative h-56 bg-muted cursor-pointer" onClick={() => handlePlayVideo(video)}>
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  <Badge className="absolute top-3 right-3 bg-black/80 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(video.duration)}
                  </Badge>
                </div>

                <CardHeader>
                  <Badge className="mb-2 bg-secondary">{video.category}</Badge>
                  <h3 className="font-bold text-lg">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">Uploaded by {video.uploadedByName}</p>
                </CardHeader>

                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground flex gap-1">
                    <Eye className="h-4 w-4" /> {video.views?.toLocaleString()}
                  </span>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePlayVideo(video)}>
                      <Play className="h-4 w-4 mr-2" /> Watch
                    </Button>

                    {isTeacher && video.uploadedBy === userProfile?.uid && (
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(video.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            {hasMore ? (
              <Button onClick={loadMore}>Load more</Button>
            ) : (
              <p className="text-sm text-muted-foreground">No more videos</p>
            )}
          </div>
        </>
      )}

      {/* DIALOGS */}
      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={loadVideosOnce}
      />

      <VideoPlayerDialog open={playerOpen} onOpenChange={setPlayerOpen} video={selectedVideo} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Videos;
