import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useAuthToken } from '../hooks/useAuthToken';
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Clock, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface NewsDetailViewProps {
  newsId: string;
  onBack: () => void;
  onDelete?: () => void;
}

interface NewsData {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  language: string;
  authorId: string;
  authorName: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  likedBy: string[];
  audioUrl?: string;
  audioFileName?: string;
  sourceUrl?: string;
  tags?: string[];
}

export const NewsDetailView: React.FC<NewsDetailViewProps> = ({ newsId, onBack, onDelete }) => {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  const isAuthor = user?.uid === news?.authorId;

  useEffect(() => {
    fetchNews();
  }, [newsId]);

  useEffect(() => {
    if (news && user) {
      setLiked(news.likedBy?.includes(user.uid) || false);
    }
  }, [news, user]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://localhost:3001/api/news/${newsId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews({
        ...data,
        publishedAt: new Date(data.publishedAt),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Error',
        description: 'Failed to load news article',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://localhost:3001/api/news/${newsId}/like`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to like news');
      }

      const data = await response.json();
      setLiked(data.liked);

      setNews((prev) =>
        prev
          ? {
              ...prev,
              likes: data.liked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
              likedBy: data.liked
                ? [...(prev.likedBy || []), user!.uid]
                : (prev.likedBy || []).filter((id) => id !== user!.uid),
            }
          : null
      );
    } catch (error) {
      console.error('Error liking news:', error);
      toast({
        title: 'Error',
        description: 'Failed to like news',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://localhost:3001/api/news/${newsId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete news');
      }

      toast({
        title: 'Success',
        description: 'News article deleted successfully',
      });

      onDelete?.();
      onBack();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete news article',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        text: news?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'News link copied to clipboard',
      });
    }
  };

  // Audio player controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      General: 'bg-gray-500',
      Politics: 'bg-blue-500',
      Sports: 'bg-green-500',
      Entertainment: 'bg-pink-500',
      Technology: 'bg-purple-500',
      Education: 'bg-indigo-500',
      Health: 'bg-red-500',
      Business: 'bg-yellow-500',
      Culture: 'bg-orange-500',
      International: 'bg-teal-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      Tamil: 'bg-rose-100 text-rose-700',
      Sinhala: 'bg-amber-100 text-amber-700',
      English: 'bg-sky-100 text-sky-700',
    };
    return colors[language] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">News article not found</p>
        <Button onClick={onBack} className="mt-4" variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {isAuthor && user?.role === 'teacher' && (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={`${getCategoryColor(news.category)} text-white`}>{news.category}</Badge>
            <Badge variant="outline" className={getLanguageColor(news.language)}>
              {news.language}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold">{news.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(news.publishedAt, 'PPP')}</span>
            </div>
            <span>•</span>
            <span>by {news.authorName}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{news.views} views</span>
            </div>
          </div>

          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Audio Player */}
          {news.audioUrl && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Volume2 className="h-5 w-5" />
                  <span className="font-semibold">Listen to this article</span>
                </div>

                <audio
                  ref={audioRef}
                  src={news.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Button size="sm" onClick={togglePlay} className="gap-2">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRestart}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full"
                  />

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{news.content}</p>
          </div>

          {/* Source Link */}
          {news.sourceUrl && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Read original source
              </a>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant={liked ? 'default' : 'outline'}
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'} ({news.likes})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this news article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

