import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Save, Eye, Globe, Calendar, User, Tag, Image as ImageIcon, Sparkles, Clock, Hash } from 'lucide-react';
import { type ArticleWithCategory, type Category } from '@shared/schema';

function ArticleEditorContent() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = id !== 'new';

  // Form state
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    contentEn: '',
    contentAr: '',
    excerptEn: '',
    excerptAr: '',
    metaDescriptionEn: '',
    metaDescriptionAr: '',
    categoryId: '',
    authorName: '',
    authorImage: '',
    featuredImage: '',
    published: false,
    featured: false,
    slug: '',
    readingTime: 0,
    publishedAt: '',
    tags: [] as string[]
  });

  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>('en');
  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Calculate reading time based on content
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Update reading time when content changes
  useEffect(() => {
    const primaryContent = activeLanguage === 'en' ? formData.contentEn : formData.contentAr;
    if (primaryContent) {
      const readingTime = calculateReadingTime(primaryContent);
      setFormData(prev => ({ ...prev, readingTime }));
    }
  }, [formData.contentEn, formData.contentAr, activeLanguage]);

  // Fetch article data for editing
  const { data: article, isLoading: articleLoading } = useQuery<ArticleWithCategory>({
    queryKey: ['/api/articles', id],
    queryFn: async () => {
      const response = await authenticatedFetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      return response.json();
    },
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await authenticatedFetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Initialize form data when article loads
  useEffect(() => {
    if (article) {
      setFormData({
        titleEn: article.titleEn || '',
        titleAr: article.titleAr || '',
        contentEn: article.contentEn || '',
        contentAr: article.contentAr || '',
        excerptEn: article.excerptEn || '',
        excerptAr: article.excerptAr || '',
        metaDescriptionEn: article.metaDescriptionEn || '',
        metaDescriptionAr: article.metaDescriptionAr || '',
        categoryId: article.categoryId?.toString() || '',
        authorName: article.authorName || '',
        authorImage: article.authorImage || '',
        featuredImage: article.featuredImage || '',
        published: article.published || false,
        featured: article.featured || false,
        slug: article.slug || '',
        readingTime: article.readingTime || 0,
        publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : '',
        tags: []
      });
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    const title = activeLanguage === 'en' ? formData.titleEn : formData.titleAr;
    if (title && !isEditing) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.titleEn, formData.titleAr, activeLanguage, isEditing]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
        // Auto-generate meta descriptions if not provided
        metaDescriptionEn: data.metaDescriptionEn || data.excerptEn?.substring(0, 160),
        metaDescriptionAr: data.metaDescriptionAr || data.excerptAr?.substring(0, 160)
      };

      const response = await authenticatedFetch(
        isEditing ? `/api/articles/${id}` : '/api/articles',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} article`);
      }

      return response.json();
    },
    onSuccess: (savedArticle) => {
      toast({
        title: 'Success',
        description: `Article ${isEditing ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      if (!isEditing) {
        navigate(`/admin/articles/${savedArticle.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} article`,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!formData.titleEn && !formData.titleAr) {
      toast({
        title: 'Validation Error',
        description: 'Article must have at least one title (English or Arabic)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.contentEn && !formData.contentAr) {
      toast({
        title: 'Validation Error',
        description: 'Article must have content in at least one language',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await authenticatedFetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        headers: {}, // Remove Content-Type to let browser set it for FormData
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, featuredImage: result.url }));
        toast({
          title: 'Success',
          description: 'Featured image uploaded successfully',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  // AI Content Generation
  const generateContent = async (type: 'title' | 'excerpt' | 'content', language: 'en' | 'ar') => {
    if (!formData.titleEn && type !== 'title') {
      toast({
        title: 'Error',
        description: 'Please provide a title first to generate content',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);
    try {
      const response = await authenticatedFetch('/api/ai/generate-content', {
        method: 'POST',
        body: JSON.stringify({
          type,
          language,
          title: formData.titleEn || formData.titleAr,
          category: categories.find(c => c.id === parseInt(formData.categoryId))?.nameEn,
          existingContent: type === 'content' ? (language === 'en' ? formData.contentEn : formData.contentAr) : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (type === 'title') {
          setFormData(prev => ({
            ...prev,
            [language === 'en' ? 'titleEn' : 'titleAr']: result.content
          }));
        } else if (type === 'excerpt') {
          setFormData(prev => ({
            ...prev,
            [language === 'en' ? 'excerptEn' : 'excerptAr']: result.content
          }));
        } else if (type === 'content') {
          setFormData(prev => ({
            ...prev,
            [language === 'en' ? 'contentEn' : 'contentAr']: result.content
          }));
        }

        toast({
          title: 'Success',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully`,
        });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate ${type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  if (articleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your article content and settings' : 'Write and publish a new article'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saveMutation.isPending ? 'Saving...' : 'Save Article'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Language Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Content Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant={activeLanguage === 'en' ? 'default' : 'outline'}
                  onClick={() => setActiveLanguage('en')}
                  size="sm"
                >
                  English
                </Button>
                <Button
                  variant={activeLanguage === 'ar' ? 'default' : 'outline'}
                  onClick={() => setActiveLanguage('ar')}
                  size="sm"
                >
                  العربية
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Title and Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeLanguage === 'en' ? 'English Content' : 'Arabic Content'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`title-${activeLanguage}`}>
                    Title {activeLanguage === 'ar' ? '(Arabic)' : '(English)'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateContent('title', activeLanguage)}
                    disabled={isGeneratingContent}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingContent ? 'Generating...' : 'AI Generate'}</span>
                  </Button>
                </div>
                <Input
                  id={`title-${activeLanguage}`}
                  value={activeLanguage === 'en' ? formData.titleEn : formData.titleAr}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [activeLanguage === 'en' ? 'titleEn' : 'titleAr']: e.target.value
                  }))}
                  placeholder={activeLanguage === 'en' ? 'Enter article title in English' : 'أدخل عنوان المقال بالعربية'}
                  dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
                  className="text-lg font-medium"
                />
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`excerpt-${activeLanguage}`}>
                    Excerpt {activeLanguage === 'ar' ? '(Arabic)' : '(English)'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateContent('excerpt', activeLanguage)}
                    disabled={isGeneratingContent || (!formData.titleEn && !formData.titleAr)}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingContent ? 'Generating...' : 'AI Generate'}</span>
                  </Button>
                </div>
                <Textarea
                  id={`excerpt-${activeLanguage}`}
                  value={activeLanguage === 'en' ? formData.excerptEn : formData.excerptAr}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [activeLanguage === 'en' ? 'excerptEn' : 'excerptAr']: e.target.value
                  }))}
                  placeholder={activeLanguage === 'en' ? 'Brief description of the article' : 'وصف مختصر للمقال'}
                  dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
                  rows={3}
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    Content {activeLanguage === 'ar' ? '(Arabic)' : '(English)'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateContent('content', activeLanguage)}
                    disabled={isGeneratingContent || (!formData.titleEn && !formData.titleAr)}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingContent ? 'Generating...' : 'AI Generate'}</span>
                  </Button>
                </div>
                <div className="mt-2">
                  <RichTextEditor
                    content={activeLanguage === 'en' ? formData.contentEn : formData.contentAr}
                    onChange={(content) => setFormData(prev => ({
                      ...prev,
                      [activeLanguage === 'en' ? 'contentEn' : 'contentAr']: content
                    }))}
                    placeholder={activeLanguage === 'en' ? 'Write your article content here...' : 'اكتب محتوى المقال هنا...'}
                    language={activeLanguage}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO optimized title (leave empty to auto-generate)"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="SEO keywords, separated by commas"
                />
              </div>
              
              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                  placeholder="Canonical URL (leave empty to auto-generate)"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Publish</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="publishedAt">Publish Date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Article Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="authorName">Author</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div>
                <Label htmlFor="authorImage">Author Image URL</Label>
                <Input
                  id="authorImage"
                  value={formData.authorImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorImage: e.target.value }))}
                  placeholder="https://example.com/author.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="readingTime" className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Reading Time (minutes)</span>
                </Label>
                <Input
                  id="readingTime"
                  type="number"
                  value={formData.readingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 0 }))}
                  placeholder="Auto-calculated"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Featured Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.featuredImage && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="featuredImageUrl">Image URL</Label>
                <Input
                  id="featuredImageUrl"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUpload">Upload Image</Label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const now = new Date().toISOString();
                  setFormData(prev => ({ ...prev, publishedAt: now }));
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Set Publish Date to Now
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const slug = (formData.titleEn || formData.titleAr)
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .trim();
                  setFormData(prev => ({ ...prev, slug }));
                }}
              >
                <Tag className="w-4 h-4 mr-2" />
                Generate Slug from Title
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditor() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ArticleEditorContent />
    </ProtectedRoute>
  );
}