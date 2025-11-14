import { useState, useEffect } from 'react';
import { Newspaper, Edit, Trash2, Eye, Heart, BarChart3, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthToken } from '@/hooks/useAuthToken';
import { CreateNewsDialog } from '@/components/CreateNewsDialog';
import { getApiEndpoint } from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  language: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  views: number;
  likes: number;
  audioUrl?: string;
}

const NewsManagement = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  useEffect(() => {
    fetchNews();
  }, [filter]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`${getApiEndpoint('/news')}?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(
        data.news.map((item: any) => ({
          ...item,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
          createdAt: new Date(item.createdAt),
        }))
      );
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Error',
        description: 'Failed to load news articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiEndpoint(`/news/${id}`), {
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

      setNews(news.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete news article',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiEndpoint(`/news/${id}`), {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update news');
      }

      toast({
        title: 'Success',
        description: `News ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });

      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: 'Error',
        description: 'Failed to update news article',
        variant: 'destructive',
      });
    }
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

  const stats = {
    total: news.length,
    published: news.filter((n) => n.published).length,
    draft: news.filter((n) => !n.published).length,
    totalViews: news.reduce((sum, n) => sum + n.views, 0),
    totalLikes: news.reduce((sum, n) => sum + n.likes, 0),
    withAudio: news.filter((n) => n.audioUrl).length,
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Newspaper className="h-8 w-8 text-primary" />
            News Management
          </h1>
          <p className="text-muted-foreground">Manage your news articles</p>
        </div>
        <CreateNewsDialog onSuccess={fetchNews} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-xs text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            <div className="text-xs text-muted-foreground">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-pink-600">{stats.totalLikes}</div>
            <div className="text-xs text-muted-foreground">Total Likes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.withAudio}</div>
            <div className="text-xs text-muted-foreground">With Audio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : news.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No News Articles</h3>
            <p className="text-sm text-muted-foreground mb-4">Start by creating your first news article</p>
            <CreateNewsDialog onSuccess={fetchNews} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getCategoryColor(item.category)} text-white`}>
                        {item.category}
                      </Badge>
                      <Badge variant="outline">{item.language}</Badge>
                      {item.published ? (
                        <Badge className="bg-green-500 text-white">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {item.audioUrl && (
                        <Badge variant="outline" className="text-primary">
                          🎧 Audio
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold">{item.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {format(item.createdAt, 'MMM dd, yyyy')}</span>
                      {item.publishedAt && <span>Published: {format(item.publishedAt, 'MMM dd, yyyy')}</span>}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span>{item.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-pink-600" />
                        <span>{item.likes} likes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant={item.published ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleTogglePublish(item.id, item.published)}
                    >
                      {item.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this news article? This action cannot be undone and will also delete
              any associated audio files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NewsManagement;

