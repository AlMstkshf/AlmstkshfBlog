import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Users, FileText, TrendingUp, Settings, Zap, Search, Tag, Globe, Clock, Download as DownloadIcon, FolderOpen, Brain, LogOut, User } from "lucide-react";
import { type ArticleWithCategory, type Category, type Download as DownloadType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

function AdminDashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout, authenticatedFetch } = useAuth();

  // Fetch all articles (no limit)
  const { data: articles } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?limit=1000");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch downloads
  const { data: downloads } = useQuery<DownloadType[]>({
    queryKey: ["/api/downloads"],
    queryFn: async () => {
      const response = await fetch("/api/downloads");
      if (!response.ok) throw new Error("Failed to fetch downloads");
      return response.json();
    },
  });

  const publishedArticles = articles?.filter(a => a.published) || [];
  const draftArticles = articles?.filter(a => !a.published) || [];

  // Filter articles based on search
  const filteredArticles = articles?.filter(article => 
    article.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.titleAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Complete blog management and automation control</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* User info and logout */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{user?.username}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
            <Link href="/admin/automation">
              <Button variant="outline" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Automation</span>
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Categories</span>
              </Button>
            </Link>
            <Link href="/admin/downloads">
              <Button variant="outline" className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4" />
                <span>Downloads</span>
              </Button>
            </Link>
            <Link href="/admin/content-strategy">
              <Button variant="outline" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Content Strategy</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
            </Link>
            <Link href="/admin/articles/new">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">All Articles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automation</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Disabled</div>
                  <p className="text-xs text-muted-foreground">AI automation inactive</p>
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
                {articles && articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">{article.titleEn}</h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={article.published ? "default" : "secondary"}>
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                            {article.category && (
                              <Badge variant="outline">{article.category.nameEn}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteArticleMutation.mutate(article.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No articles found</p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Articles are managed through the backend API
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6 mt-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Link href="/admin/articles/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </Link>
            </div>

            {/* All Articles */}
            <Card>
              <CardHeader>
                <CardTitle>All Articles ({filteredArticles.length})</CardTitle>
                <CardDescription>Manage all your blog content</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredArticles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">{article.titleEn}</h3>
                          {article.titleAr && (
                            <p className="text-sm text-gray-600 mt-1">{article.titleAr}</p>
                          )}
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
                          {article.published && (
                            <Link href={`/en/blog/${article.category?.slug}/${article.slug}`}>
                              <Button variant="ghost" size="sm">
                                <Globe className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteArticleMutation.mutate(article.id)}
                            disabled={deleteArticleMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">
                      {searchQuery ? "No articles match your search" : "No articles found"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Articles are managed through the backend API
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Categories Management</CardTitle>
                <CardDescription>Organize your content with categories</CardDescription>
              </CardHeader>
              <CardContent>
                {categories && categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{category.nameEn}</h3>
                          {category.nameAr && (
                            <p className="text-sm text-gray-600">{category.nameAr}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/en/blog/${category.slug}`}>
                            <Button variant="ghost" size="sm">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" disabled title="Category editing requires backend API">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No categories found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Downloads Management</CardTitle>
                <CardDescription>Manage PDF files, documents, and research resources</CardDescription>
              </CardHeader>
              <CardContent>
                {downloads && downloads.length > 0 ? (
                  <div className="space-y-4">
                    {downloads.map((download) => (
                      <div key={download.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">{download.title}</h3>
                          {download.titleAr && (
                            <p className="text-sm text-gray-600 mt-1">{download.titleAr}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
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
                        <div className="flex items-center space-x-2">
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
                          <Button variant="outline" size="sm" disabled title="Download editing requires file management system">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" disabled title="Delete functionality requires confirmation system">
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