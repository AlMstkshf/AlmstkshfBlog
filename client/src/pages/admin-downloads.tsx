import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUploadManager } from "@/components/admin/file-upload-manager";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Star,
  FileText,
  Image,
  File
} from "lucide-react";

interface DownloadItem {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  categoryAr?: string;
  fileType: "pdf" | "image" | "document";
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: string;
  featured: boolean;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

function AdminDownloadsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuth();

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["/api/downloads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedFetch(`/api/downloads/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete download');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Download deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete download",
        variant: "destructive",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const response = await authenticatedFetch(`/api/downloads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ featured }),
      });
      if (!response.ok) throw new Error('Failed to update download');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
  });

  const filteredDownloads = (downloads as DownloadItem[]).filter((download: DownloadItem) => {
    const matchesSearch = 
      download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || download.category === categoryFilter;
    const matchesType = typeFilter === "all" || download.fileType === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Downloads Management</h1>
        <p className="text-muted-foreground">
          Manage and organize your downloadable resources
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Manage Downloads
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <FileUploadManager />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search downloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Studies">Studies</SelectItem>
                    <SelectItem value="Reports">Reports</SelectItem>
                    <SelectItem value="Guides">Guides</SelectItem>
                    <SelectItem value="Templates">Templates</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Downloads List */}
          <div className="grid gap-4">
            {filteredDownloads.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No downloads found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || (categoryFilter !== "all") || (typeFilter !== "all") 
                      ? "Try adjusting your filters"
                      : "Upload your first file to get started"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDownloads.map((download: DownloadItem) => (
                <Card key={download.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(download.fileType)}
                          <div>
                            <h3 className="text-lg font-semibold">{download.title}</h3>
                            {download.titleAr && (
                              <h4 className="text-md text-muted-foreground" dir="rtl">
                                {download.titleAr}
                              </h4>
                            )}
                          </div>
                          {download.featured && (
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {download.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{download.category}</Badge>
                          <Badge variant="outline">{download.fileType.toUpperCase()}</Badge>
                          <Badge variant="outline">{download.fileSize}</Badge>
                          <Badge variant="outline">{download.downloadCount} downloads</Badge>
                        </div>

                        {download.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {download.tags.slice(0, 5).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {download.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{download.tags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Created: {formatDate(download.createdAt)} • 
                          Updated: {formatDate(download.updatedAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={download.featured ? "default" : "outline"}
                          onClick={() => toggleFeaturedMutation.mutate({
                            id: download.id,
                            featured: !download.featured
                          })}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(download.filePath, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(download.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDownloads() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDownloadsContent />
    </ProtectedRoute>
  );
}