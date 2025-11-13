import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { useAuthToken } from '../hooks/useAuthToken';
import { Loader2, Plus, Upload, X, Mic } from 'lucide-react';

interface CreateNewsDialogProps {
  onSuccess?: () => void;
}

export const CreateNewsDialog: React.FC<CreateNewsDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'General',
    language: 'Tamil',
    sourceUrl: '',
    tags: '',
    published: false,
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);

  const categories = [
    'General',
    'Politics',
    'Sports',
    'Entertainment',
    'Technology',
    'Education',
    'Health',
    'Business',
    'Culture',
    'International',
  ];

  const languages = ['Tamil', 'Sinhala', 'English'];

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Audio file size must be less than 20MB',
          variant: 'destructive',
        });
        return;
      }
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const headers = await getAuthHeaders();
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('summary', formData.summary || formData.content.substring(0, 200) + '...');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('sourceUrl', formData.sourceUrl);
      formDataToSend.append('published', String(formData.published));

      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      formDataToSend.append('tags', JSON.stringify(tagsArray));

      if (audioFile) {
        formDataToSend.append('audio', audioFile);
      }

      const response = await fetch('http://localhost:3001/api/news', {
        method: 'POST',
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create news article');
      }

      toast({
        title: 'Success',
        description: 'News article created successfully',
      });

      setOpen(false);
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: 'General',
        language: 'Tamil',
        sourceUrl: '',
        tags: '',
        published: false,
      });
      setAudioFile(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating news:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create news article',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add News
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create News Article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter news title..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your news content..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary (auto-generated if left empty)..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL (Optional)</Label>
            <Input
              id="sourceUrl"
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://example.com/news-source"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enter tags separated by commas (e.g., breaking, local, sports)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => document.getElementById('audio')?.click()}
              >
                <Upload className="h-4 w-4" />
                {audioFile ? 'Change Audio' : 'Upload Audio'}
              </Button>
              {audioFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mic className="h-4 w-4" />
                  <span>{audioFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAudioFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Upload an audio version of this news article (max 20MB)</p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="published" className="text-base">
                Publish Immediately
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this news article visible to students right away
              </p>
            </div>
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create News'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

