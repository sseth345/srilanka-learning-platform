import { useState, useEffect } from 'react';
import { Newspaper, Filter, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthToken } from '@/hooks/useAuthToken';
import { CreateNewsDialog } from '@/components/CreateNewsDialog';
import { NewsCard } from '@/components/NewsCard';
import { NewsDetailView } from '@/components/NewsDetailView';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  language: string;
  authorName: string;
  publishedAt: Date;
  views: number;
  likes: number;
  audioUrl?: string;
  sourceUrl?: string;
  tags?: string[];
}

const newsLinks = [
  { name: 'தினமலர் (Dinamalar)', url: 'https://www.dinamalar.com/', type: 'Local' },
  { name: 'தினகரன் (Dinakaran)', url: 'https://www.dinakaran.com/', type: 'Local' },
  { name: 'BBC Tamil', url: 'https://www.bbc.com/tamil', type: 'Global' },
  { name: 'The Hindu Tamil', url: 'https://tamil.thehindu.com/', type: 'Global' },
  { name: 'CNN Tamil', url: 'https://tamil.cnn.com/', type: 'Global' },
  { name: 'News18 Tamil', url: 'https://tamil.news18.com/', type: 'Local' },
];

const TamilNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [category, language]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (language !== 'all') params.append('language', language);

      const response = await fetch(`http://localhost:3001/api/news?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(
        data.news.map((item: any) => ({
          ...item,
          publishedAt: new Date(item.publishedAt),
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

  const fetchCategories = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('http://localhost:3001/api/news/meta/categories', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNewsClick = (newsId: string) => {
    setSelectedNews(newsId);
  };

  const handleBackToList = () => {
    setSelectedNews(null);
    fetchNews(); // Refresh to get updated view counts
  };

  if (selectedNews) {
    return <NewsDetailView newsId={selectedNews} onBack={handleBackToList} onDelete={fetchNews} />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Newspaper className="h-8 w-8 text-primary" />
            Tamil News
          </h1>
          <p className="text-muted-foreground">Read and listen to Tamil news articles</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchNews} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {user?.role === 'teacher' && <CreateNewsDialog onSuccess={fetchNews} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Sinhala">Sinhala</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>

                {(category !== 'all' || language !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategory('all');
                      setLanguage('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
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
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.role === 'teacher'
                    ? 'Start by creating your first news article'
                    : 'No news articles available yet'}
                </p>
                {user?.role === 'teacher' && <CreateNewsDialog onSuccess={fetchNews} />}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} onClick={() => handleNewsClick(item.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* News Sources */}
          <Card className="shadow-elevated">
            <CardHeader>
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                News Sources
              </h3>
              <p className="text-sm text-muted-foreground">External news websites</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {newsLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">
                    {link.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{link.type}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                News Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Articles</span>
                  <span className="font-bold">{news.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="font-bold">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Audio</span>
                  <span className="font-bold">{news.filter((n) => n.audioUrl).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TamilNews;
