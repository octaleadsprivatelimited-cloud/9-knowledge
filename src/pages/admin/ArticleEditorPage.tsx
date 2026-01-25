import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useArticle, useCreateArticle, useUpdateArticle } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useAutosave } from '@/hooks/useAutosave';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Loader2, Clock, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Badge } from '@/components/ui/badge';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const ArticleEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const { data: existingArticle, isLoading: articleLoading } = useArticle(isNew ? '' : (id || ''));
  const { data: categories } = useCategories();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    featured_image_alt: '',
    video_url: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled' | 'archived',
    scheduled_at: '',
    is_featured: false,
    is_trending: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    canonical_url: '',
    no_index: false,
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Autosave hook
  const storageKey = isNew ? 'article_draft_new' : `article_draft_${id}`;
  const { checkForDraft, clearDraft } = useAutosave({
    data: formData,
    storageKey,
    debounceMs: 3000,
    onRestore: (data) => {
      setFormData(data as typeof formData);
      toast.success('Draft restored');
    },
  });

  // Check for saved draft on mount (only for new articles)
  useEffect(() => {
    if (isNew) {
      checkForDraft();
    }
  }, [isNew, checkForDraft]);

  useEffect(() => {
    if (existingArticle) {
      setFormData({
        title: existingArticle.title || '',
        slug: existingArticle.slug || '',
        excerpt: existingArticle.excerpt || '',
        content: existingArticle.content || '',
        featured_image: existingArticle.featured_image || '',
        featured_image_alt: existingArticle.featured_image_alt || '',
        video_url: (existingArticle as any).video_url || '',
        category_id: existingArticle.category_id || '',
        status: existingArticle.status || 'draft',
        scheduled_at: (existingArticle as any).scheduled_at 
          ? new Date((existingArticle as any).scheduled_at).toISOString().slice(0, 16) 
          : '',
        is_featured: existingArticle.is_featured || false,
        is_trending: existingArticle.is_trending || false,
        meta_title: existingArticle.meta_title || '',
        meta_description: existingArticle.meta_description || '',
        meta_keywords: existingArticle.meta_keywords?.join(', ') || '',
        og_image: existingArticle.og_image || '',
        canonical_url: existingArticle.canonical_url || '',
        no_index: existingArticle.no_index || false,
      });
    }
  }, [existingArticle]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (status?: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title || !formData.slug) {
      toast.error('Please fill in required fields');
      return;
    }

    // Validate scheduled_at for scheduled articles
    if (status === 'scheduled' && !formData.scheduled_at) {
      toast.error('Please set a publish date for scheduled articles');
      return;
    }

    const articleData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      featured_image: formData.featured_image || null,
      featured_image_alt: formData.featured_image_alt || null,
      video_url: formData.video_url || null,
      category_id: formData.category_id || null,
      status: status || formData.status,
      scheduled_at: status === 'scheduled' && formData.scheduled_at 
        ? new Date(formData.scheduled_at).toISOString() 
        : null,
      is_featured: formData.is_featured,
      is_trending: formData.is_trending,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      meta_keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map((k) => k.trim()) : null,
      og_image: formData.og_image || null,
      canonical_url: formData.canonical_url || null,
      no_index: formData.no_index,
      author_id: user?.id || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    try {
      if (isNew) {
        await createArticle.mutateAsync(articleData);
        toast.success('Article created successfully');
        clearDraft();
      } else {
        await updateArticle.mutateAsync({ id: id!, ...articleData });
        toast.success('Article updated successfully');
        clearDraft();
      }
      setLastSaved(new Date());
      navigate('/admin/articles');
    } catch (error: any) {
      toast.error(error.message || 'Error saving article');
    }
  };

  if (!isNew && articleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/articles')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isNew ? 'New Article' : 'Edit Article'}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? 'Create a new blog post' : 'Update your article'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <Check className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
            <Button variant="outline" onClick={() => handleSubmit('draft')}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="secondary" onClick={() => handleSubmit('scheduled')}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button onClick={() => handleSubmit('published')}>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>Write your article content here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="article-url-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of the article"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Start writing your article..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Featured Media</CardTitle>
                <CardDescription className="text-xs">Upload image or embed video (WebP recommended, max 300KB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload - Compact */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Featured Image</Label>
                    <ImageUpload
                      value={formData.featured_image}
                      onChange={(url) => setFormData({ ...formData, featured_image: url })}
                      folder="articles"
                      aspectRatio="video"
                    />
                    <Input
                      id="featured_image"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="Or paste image URL"
                      className="text-sm"
                    />
                    <Input
                      id="featured_image_alt"
                      value={formData.featured_image_alt}
                      onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
                      placeholder="Alt text for SEO"
                      className="text-sm"
                    />
                  </div>

                  {/* Video Embed URL */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Video Embed URL</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://youtube.com/embed/... or Vimeo URL"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste YouTube, Vimeo, or other embed URLs. Video appears in article content.
                    </p>
                    {formData.video_url && (
                      <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                        <iframe
                          src={formData.video_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                          title="Video preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize your article for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="SEO description (max 160 characters)"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image">OpenGraph Image URL</Label>
                  <Input
                    id="og_image"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://9knowledge.com/article/..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="no_index"
                    checked={formData.no_index}
                    onCheckedChange={(checked) => setFormData({ ...formData, no_index: checked })}
                  />
                  <Label htmlFor="no_index">No Index (hide from search engines)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scheduled Publishing DateTime */}
                {formData.status === 'scheduled' && (
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                    <Label htmlFor="scheduled_at" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Publish Date & Time
                    </Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Article will be automatically published at this time.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Article</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_trending"
                    checked={formData.is_trending}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_trending: checked })}
                  />
                  <Label htmlFor="is_trending">Trending Article</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ArticleEditorPage;
