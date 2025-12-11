// src/pages/Videos.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

/* ------------------ utilities ------------------ */
const formatDuration = (seconds?: number) => {
  if (!seconds && seconds !== 0) return "00:00";
  const hrs = Math.floor((seconds || 0) / 3600);
  const mins = Math.floor(((seconds || 0) % 3600) / 60);
  const secs = Math.floor((seconds || 0) % 60);
  return hrs > 0
    ? `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
    : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/* ------------------ debounce hook ------------------ */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ------------------ main component ------------------ */
const PAGE_SIZE = 20;

const Videos: React.FC = () => {
  const { userProfile } = useAuth();
  const { getAuthHeaders } = useAuthToken();

  // core data
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // dialogs / actions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isTeacher = userProfile?.role === "teacher";

  /* ---- stable refs so fetch function stays identical across renders ---- */
  const authRef = useRef(getAuthHeaders);
  useEffect(() => {
    authRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

  // abort controller ref for cancelling inflight fetches
  const abortRef = useRef<AbortController | null>(null);

  // detect identical repeated requests: key by category+search+offset
  const lastRequestKeyRef = useRef<string | null>(null);

  // prevents initial double-call if layout mounts/unmounts quickly
  const mountedRef = useRef(false);

  /* ------------------ fetch function (stable) ------------------ */
  // intentionally no deps so it's referentially stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchVideos = useCallback(
    async ({ offset = 0, append = false, showLoading = true } = {}) => {
      const category = selectedCategory;
      const search = debouncedSearch;
      const pageSize = PAGE_SIZE;
      const requestKey = `${category}::${search}::${offset}`;

      // dedupe identical inflight or recent requests
      if (lastRequestKeyRef.current === requestKey) {
        // nothing to do — prevents redundant fetches
        return;
      }
      lastRequestKeyRef.current = requestKey;

      // cancel previous controller
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {}
      }
      const controller = new AbortController();
      abortRef.current = controller;

      if (showLoading) {
        offset === 0 ? setLoading(true) : setLoadingMore(true);
      }

      try {
        const headers = await authRef.current(); // stable getter
        const params = new URLSearchParams();
        params.set("limit", String(pageSize));
        params.set("offset", String(offset));
        if (category && category !== "all") params.set("category", category);
        if (search) params.set("search", search);

        const url = `${getApiEndpoint("/videos")}?${params.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          // log non-200 but don't crash UI
          console.warn("Videos fetch non-OK", res.status, await res.text().catch(()=>""));
          return;
        }

        const json = await res.json();

        // normalise createdAt if Firestore timestamps (string or object with toDate)
        const normalized = (json || []).map((v: any) => ({
          ...v,
          createdAt: v.createdAt?.toDate ? v.createdAt.toDate() : v.createdAt ? new Date(v.createdAt) : new Date(),
          updatedAt: v.updatedAt?.toDate ? v.updatedAt.toDate() : v.updatedAt ? new Date(v.updatedAt) : undefined,
        }));

        // set state: avoid unnecessary re-renders when identical
        setVideos((prev) => {
          if (!append) {
            // shallow compare by length and ids
            const same =
              prev.length === normalized.length &&
              prev.every((p, i) => p.id === normalized[i]?.id);
            if (same) return prev;
            return normalized;
          } else {
            // append: avoid duplicates
            const combined = [...prev];
            for (const it of normalized) {
              if (!combined.find((x) => x.id === it.id)) combined.push(it);
            }
            return combined;
          }
        });

        // detect if there may be more (server may return less than requested)
        setHasMore((json || []).length >= pageSize);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // expected when cancelling - ignore
        } else {
          console.error("Error fetching videos:", err);
          // surface a minimal toast but don't spam
          toast.error("Failed to fetch videos");
        }
      } finally {
        if (showLoading) {
          offset === 0 ? setLoading(false) : setLoadingMore(false);
        }
        // allow new identical requests in future cycles
        setTimeout(() => {
          lastRequestKeyRef.current = null;
        }, 200);
      }
    },
    // intentionally not depending on getAuthHeaders so function is stable
    // selectedCategory and debouncedSearch are read from outer scope each call
    []
  );

  /* ------------------ initial + filter effect ------------------ */
  // Only run fetch on mount and when debounced search or category changes.
  useEffect(() => {
    // prevent double-run pattern when component mount/unmount quickly
    if (!mountedRef.current) mountedRef.current = true;

    // always fetch page 0 when filters change
    fetchVideos({ offset: 0, append: false, showLoading: true });

    // cleanup on unmount: abort running request
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
    // We intentionally only depend on debouncedSearch and selectedCategory here
    // fetchVideos is stable via useCallback above.
  }, [selectedCategory, debouncedSearch, fetchVideos]);

  /* ------------------ load more ------------------ */
  const loadMore = async () => {
    if (loadingMore) return;
    const offset = videos.length;
    await fetchVideos({ offset, append: true, showLoading: true });
  };

  /* ------------------ play video (safe) ------------------ */
  const handlePlayVideo = async (video: any) => {
    try {
      // optimistic stream URL fallback
      let streamingUrl = video.streamingUrl;

      // try to update view count & get streaming url from server
      try {
        const headers = await authRef.current();
        const res = await fetch(getApiEndpoint(`/videos/${video.id}/view`), {
          method: "POST",
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          streamingUrl = data.streamingUrl || streamingUrl;
        }
      } catch (err) {
        // network/view update failed — proceed with fallback streamingUrl
        console.warn("View update failed:", err);
      }

      setSelectedVideo({ ...video, streamingUrl });
      setPlayerOpen(true);

      // Background refresh (non-blocking, won't set global loading)
      fetchVideos({ offset: 0, append: false, showLoading: false });
    } catch (err) {
      console.error("Failed to play video:", err);
      toast.error("Failed to play video");
    }
  };

  /* ------------------ delete video ------------------ */
  const confirmDelete = (id: string) => {
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    setDeleting(true);
    try {
      const headers = await authRef.current();
      const res = await fetch(getApiEndpoint(`/videos/${videoToDelete}`), {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn("Delete failed:", res.status, body);
        throw new Error("Delete failed");
      }

      toast.success("Video deleted");
      setDeleteDialogOpen(false);
      setVideoToDelete(null);

      // refresh first page (not blocking UI)
      fetchVideos({ offset: 0, append: false, showLoading: false });
    } catch (err) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------ categories memo ------------------ */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    videos.forEach((v) => {
      if (v?.category) cats.add(v.category);
    });
    return ["all", ...Array.from(cats)];
  }, [videos]);

  /* ------------------ UI render ------------------ */
  return (
    <div className="space-y-6 animate-in">
      {/* header */}
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

      {/* search + filter */}
      <Card className="shadow-elevated border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchVideos({ offset: 0, append: false, showLoading: true })}
                className="flex-1"
              />
              <Button onClick={() => fetchVideos({ offset: 0, append: false, showLoading: true })}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* loading */}
      {loading && (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading videos...</p>
          </CardContent>
        </Card>
      )}

      {/* no videos */}
      {!loading && videos.length === 0 && (
        <Card className="shadow-elevated border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Play className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg mb-2">No videos found</p>
            <p className="text-muted-foreground">{isTeacher ? "Upload your first lecture video" : "No videos available"}</p>
          </CardContent>
        </Card>
      )}

      {/* grid */}
      {!loading && videos.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="shadow-elevated hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border-2">
                <div className="relative h-56 bg-muted cursor-pointer overflow-hidden" onClick={() => handlePlayVideo(video)}>
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

                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex gap-2">
                    <Eye className="h-4 w-4" />
                    {video.views?.toLocaleString()}
                  </span>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePlayVideo(video)}>
                      <Play className="h-4 w-4 mr-2" /> Watch
                    </Button>

                    {isTeacher && video.uploadedBy === userProfile?.uid && (
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(video.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* load more */}
          <div className="flex justify-center mt-6">
            {hasMore ? (
              <Button onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Load more
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">No more videos</p>
            )}
          </div>
        </>
      )}

      {/* dialogs */}
      <VideoUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUploadSuccess={() => fetchVideos({ offset: 0, append: false, showLoading: true })} />

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
