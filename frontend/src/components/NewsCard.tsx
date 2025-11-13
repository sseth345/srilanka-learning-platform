import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Heart, Clock, Volume2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: {
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
  };
  onClick: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
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

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={onClick}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge className={`${getCategoryColor(news.category)} text-white`}>{news.category}</Badge>
          <Badge variant="outline" className={getLanguageColor(news.language)}>
            {news.language}
          </Badge>
        </div>

        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{news.title}</h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
          </div>
          <span>•</span>
          <span>by {news.authorName}</span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{news.summary}</p>

        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {news.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {news.tags.length > 4 && <Badge variant="secondary" className="text-xs">+{news.tags.length - 4}</Badge>}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{news.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{news.likes}</span>
          </div>
          {news.audioUrl && (
            <div className="flex items-center gap-1 text-primary">
              <Volume2 className="h-4 w-4" />
              <span>Audio</span>
            </div>
          )}
        </div>

        {news.sourceUrl && (
          <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => {
            e.stopPropagation();
            window.open(news.sourceUrl, '_blank');
          }}>
            <ExternalLink className="h-3 w-3" />
            Source
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

