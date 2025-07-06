import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, Image, File, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadData {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  categoryAr?: string;
  fileType: "pdf" | "image" | "document";
  featured: boolean;
  tags: string[];
}

interface UploadedFile {
  file: File;
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export function FileUploadManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<FileUploadData>({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "",
    categoryAr: "",
    fileType: "pdf",
    featured: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/downloads/upload", {
        method: "POST",
        body: data,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      status: 'pending' as const,
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const resetForm = () => {
    setFiles([]);
    setFormData({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      fileType: "pdf",
      featured: false,
      tags: [],
    });
    setTagInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const uploadData = new FormData();
    
    // Add file
    uploadData.append('file', files[0].file);
    
    // Add metadata
    uploadData.append('title', formData.title);
    if (formData.titleAr) uploadData.append('titleAr', formData.titleAr);
    uploadData.append('description', formData.description);
    if (formData.descriptionAr) uploadData.append('descriptionAr', formData.descriptionAr);
    uploadData.append('category', formData.category);
    if (formData.categoryAr) uploadData.append('categoryAr', formData.categoryAr);
    uploadData.append('fileType', formData.fileType);
    uploadData.append('featured', formData.featured.toString());
    uploadData.append('tags', JSON.stringify(formData.tags));

    uploadMutation.mutate(uploadData);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type.includes('image')) return <Image className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          File Upload Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports PDF, Images (JPG, PNG), and Documents (DOC, DOCX)
          </p>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Selected Files</h3>
            {files.map((fileItem, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                {fileItem.preview ? (
                  <img src={fileItem.preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                ) : (
                  getFileIcon(fileItem.file)
                )}
                <div className="flex-1">
                  <p className="font-medium">{fileItem.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                  {fileItem.uploadProgress > 0 && (
                    <Progress value={fileItem.uploadProgress} className="mt-2" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploadMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (English) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleAr">Title (Arabic)</Label>
              <Input
                id="titleAr"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (English) *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                dir="rtl"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category (English) *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="studies">Studies</SelectItem>
                  <SelectItem value="guides">Guides</SelectItem>
                  <SelectItem value="infographics">Infographics</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryAr">Category (Arabic)</Label>
              <Select
                value={formData.categoryAr}
                onValueChange={(value) => setFormData({ ...formData, categoryAr: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="التقارير">التقارير</SelectItem>
                  <SelectItem value="الدراسات">الدراسات</SelectItem>
                  <SelectItem value="الأدلة">الأدلة</SelectItem>
                  <SelectItem value="الإنفوجرافيك">الإنفوجرافيك</SelectItem>
                  <SelectItem value="القوالب">القوالب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type</Label>
              <Select
                value={formData.fileType}
                onValueChange={(value: "pdf" | "image" | "document") => setFormData({ ...formData, fileType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured">Featured Resource</Label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={uploadMutation.isPending || files.length === 0}
              className="flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}