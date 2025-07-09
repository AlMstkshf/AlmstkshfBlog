import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { useState, useMemo, useCallback } from "react";
import { Plus, Edit, Trash2, Users, FileText, TrendingUp, Settings, Zap, Search, Tag, Globe, Clock, Download as DownloadIcon, FolderOpen, Brain, LogOut, User, Loader2, AlertTriangle, X, RefreshCw } from "lucide-react";
// TODO: Replace with the correct import path or define the types locally if the shared schema does not exist.
export type ArticleWithCategory = {
  id: number;
  titleEn: string;
  titleAr?: string;
  slug: string;
  published: boolean;
  createdAt?: string;
  category?: {
    id: number;
    nameEn: string;
    nameAr?: string;
    slug: string;
  };
};

export type CategorySelect = {
  id: number;
  nameEn: string;
  nameAr?: string;
  slug: string;
};

export type DownloadSelect = {
  id: number;
  title: string;
  titleAr?: string;
  category: string;
  featured: boolean;
  fileSize: string;
  downloadCount?: number;
  filePath: string;
  description?: string;
};
import { useToast } from "../../hooks/use-toast";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { useAuth } from "../../hooks/use-auth";
import { useDebounce } from "../../hooks/use-debounce";

// Helper components for loading and error states
function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ErrorCard({ title, error, onRetry }: { title: string; error: Error; onRetry: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 text-red-600 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">{title}</span>
        </div>
        <p className="text-sm text-red-600 mb-4">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="text-red-600 border-red-200 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function AdminDashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<ArticleWithCategory | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout, authenticatedFetch } = useAuth();
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch all articles with error handling and loading states
  const { 
    data: articles, 
    isLoading: articlesLoading, 
    error: articlesError,
    refetch: refetchArticles 
  } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?limit=1000");
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories with error handling
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useQuery<CategorySelect[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch downloads with error handling
  const { 
    data: downloads, 
    isLoading: downloadsLoading, 
    error: downloadsError,
    refetch: refetchDownloads 
  } = useQuery<DownloadSelect[]>({
    queryKey: ["/api/downloads"],
    queryFn: async () => {
      const response = await fetch("/api/downloads");
      if (!response.ok) {
        throw new Error(`Failed to fetch downloads: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoized computed values for better performance
  const publishedArticles = useMemo(() => 
    articles?.filter(a => a.published) || [], 
    [articles]
  );
  
  const draftArticles = useMemo(() => 
    articles?.filter(a => !a.published) || [], 
    [articles]
  );

  // Memoized filtered articles with debounced search
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!debouncedSearchQuery.trim()) return articles;
    
    const query = debouncedSearchQuery.toLowerCase();
    return articles.filter(article => 
      article.titleEn.toLowerCase().includes(query) ||
      article.titleAr?.toLowerCase().includes(query) ||
      article.category?.nameEn.toLowerCase().includes(query)
    );
  }, [articles, debouncedSearchQuery]);

  // Handle delete confirmation
  const handleDeleteClick = useCallback((article: ArticleWithCategory) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  }, []);

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: number) => {
      const response = await authenticatedFetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article deleted successfully",
        description: "The article has been removed from your blog.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteConfirm = useCallback(() => {
    if (articleToDelete) {
      deleteArticleMutation.mutate(articleToDelete.id);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  }, [articleToDelete, deleteArticleMutation]);

  // Error retry handlers
  const handleRetryArticles = useCallback(() => {
    refetchArticles();
  }, [refetchArticles]);

  const handleRetryCategories = useCallback(() => {
    refetchCategories();
  }, [refetchCategories]);

  const handleRetryDownloads = useCallback(() => {
    refetchDownloads();
  }, [refetchDownloads]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-secondary">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Complete blog management and automation control</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* User info and logout */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{user?.username}</span>
            </div>
            
            {/* Navigation buttons - responsive grid */}
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={logout}
                className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <Link href="/admin/automation">
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full" title="Automation">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Automation</span>
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full" title="Categories">
                  <Tag className="w-4 h-4" />
                  <span className="hidden sm:inline">Categories</span>
                </Button>
              </Link>
              <Link href="/admin/downloads">
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full" title="Downloads">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Downloads</span>
                </Button>
              </Link>
              <Link href="/admin/content-strategy">
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full" title="Content Strategy">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Strategy</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full" title="Settings">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Link href="/admin/articles/new" className="col-span-2 sm:col-span-1">
                <Button className="flex items-center justify-center space-x-2 w-full">
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="articles" className="text-xs sm:text-sm">Articles</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="downloads" className="text-xs sm:text-sm">Downloads</TabsTrigger>
            <TabsTrigger value="automation" className="text-xs sm:text-sm">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Articles Stats */}
              {articlesLoading ? (
                <StatsCardSkeleton />
              ) : articlesError ? (
                <ErrorCard title="Articles Error" error={articlesError} onRetry={handleRetryArticles} />
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articles?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {publishedArticles.length} published, {draftArticles.length} drafts
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Published Stats */}
              {articlesLoading ? (
                <StatsCardSkeleton />
              ) : articlesError ? (
                <div></div> // Empty div to maintain grid layout
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{publishedArticles.length}</div>
                    <p className="text-xs text-muted-foreground">Active content</p>
                  </CardContent>
                </Card>
              )}

              {/* Categories Stats */}
              {categoriesLoading ? (
                <StatsCardSkeleton />
              ) : categoriesError ? (
                <ErrorCard title="Categories Error" error={categoriesError} onRetry={handleRetryCategories} />
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{categories?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Active categories</p>
                  </CardContent>
                </Card>
              )}

              {/* Downloads Stats */}
              {downloadsLoading ? (
                <StatsCardSkeleton />
              ) : downloadsError ? (
                <ErrorCard title="Downloads Error" error={downloadsError} onRetry={handleRetryDownloads} />
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                    <DownloadIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{downloads?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">PDF files & resources</p>
                  </CardContent>
                </Card>
              )}

              {/* Automation Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automation</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">AI automation running</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest blog content and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : articlesError ? (
                  <ErrorCard title="Failed to load articles" error={articlesError} onRetry={handleRetryArticles} />
                ) : articles && articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">{article.titleEn}</h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={article.published ? "default" : "secondary"}>
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                            {article.category && (
                              <Badge variant="outline">{article.category.nameEn}</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="outline" size="sm" title="Edit article">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(article)}
                            disabled={deleteArticleMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete article"
                          >
                            {deleteArticleMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-slate-600">No articles found</p>
                    <Link href="/admin/articles/new">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Article
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6 mt-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  aria-label="Search articles"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {debouncedSearchQuery !== searchQuery && searchQuery && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Link href="/admin/articles/new" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </Link>
            </div>

            {/* All Articles */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Articles {!articlesLoading && `(${filteredArticles.length})`}
                  {articlesLoading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                </CardTitle>
                <CardDescription>Manage all your blog content</CardDescription>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : articlesError ? (
                  <ErrorCard title="Failed to load articles" error={articlesError} onRetry={handleRetryArticles} />
                ) : filteredArticles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary truncate">{article.titleEn}</h3>
                          {article.titleAr && (
                            <p className="text-sm text-gray-600 mt-1 truncate">{article.titleAr}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant={article.published ? "default" : "secondary"}>
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                            {article.category && (
                              <Badge variant="outline">{article.category.nameEn}</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {article.published && (
                            <Link href={`/en/blog/${article.category?.slug}/${article.slug}`}>
                              <Button variant="ghost" size="sm" title="View published article">
                                <Globe className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="outline" size="sm" title="Edit article">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(article)}
                            disabled={deleteArticleMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete article"
                          >
                            {deleteArticleMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-slate-600">
                      {searchQuery ? "No articles match your search" : "No articles found"}
                    </p>
                    {searchQuery ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery("")}
                        className="mt-4"
                      >
                        Clear search
                      </Button>
                    ) : (
                      <Link href="/admin/articles/new">
                        <Button className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Article
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Categories Management {!categoriesLoading && categories && `(${categories.length})`}
                  {categoriesLoading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                </CardTitle>
                <CardDescription>Organize your content with categories</CardDescription>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : categoriesError ? (
                  <ErrorCard title="Failed to load categories" error={categoriesError} onRetry={handleRetryCategories} />
                ) : categories && categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{category.nameEn}</h3>
                          {category.nameAr && (
                            <p className="text-sm text-gray-600 truncate">{category.nameAr}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1 truncate">Slug: {category.slug}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link href={`/en/blog/${category.slug}`}>
                            <Button variant="ghost" size="sm" title="View category page">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled 
                            title="Category editing requires backend API"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-slate-600">No categories found</p>
                    <Link href="/admin/categories">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Manage Categories
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Downloads Management {!downloadsLoading && downloads && `(${downloads.length})`}
                  {downloadsLoading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                </CardTitle>
                <CardDescription>Manage PDF files, documents, and research resources</CardDescription>
              </CardHeader>
              <CardContent>
                {downloadsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : downloadsError ? (
                  <ErrorCard title="Failed to load downloads" error={downloadsError} onRetry={handleRetryDownloads} />
                ) : downloads && downloads.length > 0 ? (
                  <div className="space-y-4">
                    {downloads.map((download) => (
                      <div key={download.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary truncate">{download.title}</h3>
                          {download.titleAr && (
                            <p className="text-sm text-gray-600 mt-1 truncate">{download.titleAr}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline">{download.category}</Badge>
                            <Badge variant={download.featured ? "default" : "secondary"}>
                              {download.featured ? "Featured" : "Regular"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {download.fileSize} • {download.downloadCount || 0} downloads
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {download.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <a 
                            href={download.filePath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex"
                          >
                            <Button variant="ghost" size="sm" title="Preview file">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled 
                            title="Download editing requires file management system"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700" 
                            disabled 
                            title="Delete functionality requires confirmation system"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DownloadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-slate-600">No downloads found</p>
                    <Link href="/admin/downloads">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Download
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Control automated content generation and publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">News Aggregation</h3>
                      <p className="text-sm text-gray-600">Automatically discover trending Middle East media news</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Publishing Schedule</h3>
                      <p className="text-sm text-gray-600">Monday & Friday at 7:00 AM Dubai time</p>
                    </div>
                    <Link href="/admin/automation">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">AI Content Generation</h3>
                      <p className="text-sm text-gray-600">SEO-optimized bilingual articles with OpenAI</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{articleToDelete?.titleEn}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleteArticleMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteArticleMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteArticleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Article
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}