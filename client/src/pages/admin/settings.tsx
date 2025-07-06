import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Zap, Clock, Globe, Mail, Key, Database, Settings as SettingsIcon, UserCog, Shield, Plus, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

const settingsSchema = z.object({
  // Publishing Schedule
  publishingEnabled: z.boolean(),
  publishingDays: z.array(z.string()),
  publishingTime: z.string(),
  timezone: z.string(),
  articlesPerWeek: z.number().min(1).max(7),
  
  // News Aggregation
  newsAggregationEnabled: z.boolean(),
  newsCountries: z.array(z.string()),
  newsKeywords: z.array(z.string()),
  
  // AI Content Generation
  aiContentEnabled: z.boolean(),
  contentLanguages: z.array(z.string()),
  seoOptimization: z.boolean(),
  
  // Email Automation
  emailNotifications: z.boolean(),
  adminEmail: z.string().email().optional(),
  newsletterEnabled: z.boolean(),
  
  // SEO Settings
  siteName: z.string(),
  siteDescription: z.string(),
  defaultMetaDescription: z.string(),
  
  // System Settings
  cacheEnabled: z.boolean(),
  debugMode: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function AdminSettingsContent() {
  const [activeSection, setActiveSection] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [apiKeyForm, setApiKeyForm] = useState({
    serviceName: "",
    keyName: "",
    keyValue: "",
    description: "",
    isActive: true
  });
  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<number | null>(null);
  const [isFixingContent, setIsFixingContent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuth();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  // Fetch API keys
  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ["/api/admin/api-keys"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/admin/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return response.json();
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      publishingEnabled: true,
      publishingDays: ["monday", "friday"],
      publishingTime: "07:00",
      timezone: "Asia/Dubai",
      articlesPerWeek: 2,
      newsAggregationEnabled: true,
      newsCountries: ["ae", "sa", "eg", "qa", "bh"],
      newsKeywords: ["media", "technology", "business", "government"],
      aiContentEnabled: true,
      contentLanguages: ["en", "ar"],
      seoOptimization: true,
      emailNotifications: true,
      adminEmail: "rased@almstkshf.com",
      newsletterEnabled: true,
      siteName: "Almstkshf Media Monitoring",
      siteDescription: "Leading media monitoring and digital analytics company in the Middle East",
      defaultMetaDescription: "Stay informed with the latest Middle East media insights and digital analytics from Almstkshf.",
      cacheEnabled: true,
      debugMode: false,
      ...settings,
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await authenticatedFetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings saved successfully",
        description: "Your configuration has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testAutomation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/api/automation/test", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Test automation failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test successful",
        description: "Automation system is working correctly.",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "There was an issue with the automation system.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    saveSettings.mutate(data);
  };

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      const response = await authenticatedFetch("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) throw new Error("Failed to change password");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Password Change Request",
        description: data?.message || "Password change request submitted successfully",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // API Key mutations
  const createApiKeyMutation = useMutation({
    mutationFn: async (apiKeyData: any) => {
      const response = await authenticatedFetch("/api/admin/api-keys", {
        method: "POST",
        body: JSON.stringify(apiKeyData),
      });
      if (!response.ok) throw new Error("Failed to create API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Added",
        description: "New API key has been added successfully",
      });
      setApiKeyForm({ serviceName: "", keyName: "", keyValue: "", description: "", isActive: true });
      setShowAddApiKey(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add API key",
        variant: "destructive",
      });
    },
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await authenticatedFetch(`/api/admin/api-keys/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Updated",
        description: "API key has been updated successfully",
      });
      setEditingApiKey(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API key",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedFetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Deleted",
        description: "API key has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  // Arabic content fix function
  const handleFixArabicContent = async () => {
    setIsFixingContent(true);
    try {
      const response = await authenticatedFetch("/api/admin/fix-arabic-content", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fix Arabic content");
      }
      
      const result = await response.json();
      
      toast({
        title: "Arabic Content Fix Complete",
        description: `Fixed ${result.fixed} articles, skipped ${result.skipped}, errors: ${result.errors}`,
      });
      
      // Refresh articles data
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fix Arabic content",
        variant: "destructive",
      });
    } finally {
      setIsFixingContent(false);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const handleAddApiKey = () => {
    if (!apiKeyForm.serviceName || !apiKeyForm.keyName || !apiKeyForm.keyValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createApiKeyMutation.mutate(apiKeyForm);
  };

  const handleUpdateApiKey = (id: number, data: any) => {
    updateApiKeyMutation.mutate({ id, data });
  };

  const handleDeleteApiKey = (id: number) => {
    if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  const resetApiKeyForm = () => {
    setApiKeyForm({ serviceName: "", keyName: "", keyValue: "", description: "", isActive: true });
    setShowAddApiKey(false);
    setEditingApiKey(null);
  };

  const sections = [
    { id: "profile", label: "Admin Profile", icon: UserCog },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "publishing", label: "Publishing", icon: Clock },
    { id: "news", label: "News Aggregation", icon: Globe },
    { id: "ai", label: "AI Content", icon: Zap },
    { id: "email", label: "Email & Notifications", icon: Mail },
    { id: "seo", label: "SEO Settings", icon: SettingsIcon },
    { id: "system", label: "System", icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-secondary">Settings</h1>
              <p className="text-slate-600 mt-2">View system settings (AI automation disabled)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled
              title="AI automation testing disabled - manual management only"
            >
              Test Automation (Disabled)
            </Button>
            <Button
              disabled
              className="flex items-center space-x-2"
              title="Settings save requires backend integration"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings (Disabled)</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                          activeSection === section.id ? "bg-primary/10 text-primary border-r-2 border-primary" : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Admin Profile */}
                {activeSection === "profile" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserCog className="w-5 h-5" />
                          Admin Profile
                        </CardTitle>
                        <CardDescription>
                          Manage admin account credentials and security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Current Admin Username</Label>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                                <span className="font-mono text-sm">admin</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Username for admin dashboard access</p>
                            </div>
                            
                            <div>
                              <Label className="text-base font-medium">Admin Email</Label>
                              <Input
                                value={form.watch("adminEmail") || "rased@almstkshf.com"}
                                onChange={(e) => form.setValue("adminEmail", e.target.value)}
                                placeholder="admin@example.com"
                                type="email"
                                className="mt-2"
                              />
                              <p className="text-sm text-gray-500 mt-1">Email for system notifications and reports</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Security Status</Label>
                              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">Admin Access Active</span>
                                </div>
                                <p className="text-xs text-green-700 mt-1">Full system administration privileges</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-base font-medium">Current Password</Label>
                              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Key className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-amber-800">Default Password Active</span>
                                </div>
                                <p className="text-xs text-amber-700 mt-1">Consider changing from default for security</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-lg font-semibold mb-4">Admin Permissions</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: "Article Management", desc: "Delete articles (create/edit via API only)", active: true },
                              { label: "Category Management", desc: "View categories (management via API only)", active: true },
                              { label: "User Management", desc: "Newsletter subscribers", active: true },
                              { label: "System Settings", desc: "View settings (AI automation disabled)", active: false },
                              { label: "Email Management", desc: "Email automation disabled", active: false },
                              { label: "Analytics Access", desc: "View performance metrics", active: true }
                            ].map((permission, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{permission.label}</p>
                                  <p className="text-xs text-gray-500">{permission.desc}</p>
                                </div>
                                <Badge variant={permission.active ? "default" : "secondary"}>
                                  {permission.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-4">Change Admin Password</h5>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                                <Input
                                  id="currentPassword"
                                  type="password"
                                  placeholder="Enter current password"
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  placeholder="Enter new password"
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-xs text-blue-700">
                                Password must be at least 8 characters with letters and numbers
                              </p>
                              <Button 
                                type="button" 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled
                                title="Password change requires backend integration"
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Update Password (Disabled)
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* API Keys Management */}
                {activeSection === "api-keys" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Key className="w-5 h-5" />
                              API Keys Management
                            </CardTitle>
                            <CardDescription>
                              Securely manage API keys for external services like OpenAI, NewsAPI, SendGrid, and others
                            </CardDescription>
                          </div>
                          <Button
                            disabled
                            className="flex items-center gap-2"
                            title="API key management requires backend integration"
                          >
                            <Plus className="w-4 h-4" />
                            Add API Key (Disabled)
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {apiKeysLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Key className="w-6 h-6 animate-spin" />
                            <span className="ml-2">Loading API keys...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {apiKeys && apiKeys.length > 0 ? (
                              apiKeys.map((key: any) => (
                                <div key={key.id} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg">{key.keyName}</h3>
                                      <p className="text-sm text-gray-600">{key.serviceName}</p>
                                      {key.description && (
                                        <p className="text-sm text-gray-500 mt-1">{key.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={key.isActive ? "default" : "secondary"}>
                                        {key.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled
                                        title="API key editing requires backend integration"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteApiKey(key.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">API Key:</span>
                                      <span className="ml-2 font-mono">{key.keyValue}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Last Used:</span>
                                      <span className="ml-2">
                                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Key className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys Found</h3>
                                <p className="text-gray-600 mb-4">Add your first API key to start using external services</p>
                                <Button disabled title="API key management requires backend integration">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add API Key (Disabled)
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Add API Key Form */}
                    {showAddApiKey && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Add New API Key</CardTitle>
                          <CardDescription>
                            Enter the details for your new API key. All keys are stored securely.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="serviceName">Service Name *</Label>
                              <Select
                                value={apiKeyForm.serviceName}
                                onValueChange={(value) => setApiKeyForm(prev => ({ ...prev, serviceName: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="openai">OpenAI</SelectItem>
                                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                                  <SelectItem value="newsapi">NewsAPI</SelectItem>
                                  <SelectItem value="newsdata">NewsData.io</SelectItem>
                                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                                  <SelectItem value="twilio">Twilio</SelectItem>
                                  <SelectItem value="custom">Custom Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="keyName">Display Name *</Label>
                              <Input
                                id="keyName"
                                placeholder="e.g., OpenAI Production Key"
                                value={apiKeyForm.keyName}
                                onChange={(e) => setApiKeyForm(prev => ({ ...prev, keyName: e.target.value }))}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="keyValue">API Key Value *</Label>
                            <Input
                              id="keyValue"
                              type="password"
                              placeholder="Enter your API key"
                              value={apiKeyForm.keyValue}
                              onChange={(e) => setApiKeyForm(prev => ({ ...prev, keyValue: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              placeholder="Brief description of this API key's purpose"
                              value={apiKeyForm.description}
                              onChange={(e) => setApiKeyForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={apiKeyForm.isActive}
                                onCheckedChange={(checked) => setApiKeyForm(prev => ({ ...prev, isActive: checked }))}
                              />
                              <Label className="text-sm">Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" onClick={resetApiKeyForm}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddApiKey}
                                disabled={createApiKeyMutation.isPending}
                              >
                                {createApiKeyMutation.isPending ? "Adding..." : "Add API Key"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Service Integration Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Integration Status</CardTitle>
                        <CardDescription>
                          Overview of connected external services and their status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { name: "OpenAI", service: "openai", desc: "AI content generation", required: true },
                            { name: "NewsAPI", service: "newsapi", desc: "News aggregation", required: true },
                            { name: "SendGrid", service: "sendgrid", desc: "Email notifications", required: false },
                            { name: "Anthropic", service: "anthropic", desc: "Advanced AI features", required: false },
                            { name: "Twilio", service: "twilio", desc: "SMS notifications", required: false },
                            { name: "NewsData.io", service: "newsdata", desc: "Additional news sources", required: false }
                          ].map((service) => {
                            const hasKey = apiKeys?.some((key: any) => key.serviceName === service.service && key.isActive);
                            return (
                              <div key={service.service} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-medium">{service.name}</h3>
                                  <Badge variant={hasKey ? "default" : service.required ? "destructive" : "secondary"}>
                                    {hasKey ? "Connected" : service.required ? "Required" : "Optional"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{service.desc}</p>
                                {!hasKey && service.required && (
                                  <p className="text-xs text-red-600 font-medium">
                                    API key required for core functionality
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Publishing Settings */}
                {activeSection === "publishing" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Publishing Schedule</CardTitle>
                      <CardDescription>
                        Configure when and how often content is automatically published
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="publishingEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Automatic Publishing</FormLabel>
                              <FormDescription>
                                Automatically publish AI-generated articles on schedule
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="publishingTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishing Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormDescription>Time of day to publish (Dubai timezone)</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="articlesPerWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Articles Per Week</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 article</SelectItem>
                                  <SelectItem value="2">2 articles</SelectItem>
                                  <SelectItem value="3">3 articles</SelectItem>
                                  <SelectItem value="4">4 articles</SelectItem>
                                  <SelectItem value="5">5 articles</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium">Publishing Days</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={day}
                                checked={form.watch("publishingDays")?.includes(day)}
                                onChange={(e) => {
                                  const current = form.getValues("publishingDays") || [];
                                  if (e.target.checked) {
                                    form.setValue("publishingDays", [...current, day]);
                                  } else {
                                    form.setValue("publishingDays", current.filter(d => d !== day));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={day} className="text-sm capitalize">
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* News Aggregation Settings */}
                {activeSection === "news" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>News Aggregation</CardTitle>
                      <CardDescription>
                        Configure sources and topics for automated news discovery
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="newsAggregationEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable News Aggregation</FormLabel>
                              <FormDescription>
                                Automatically discover trending news from Middle East sources
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label className="text-base font-medium">Target Countries</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {[
                            { code: "ae", name: "UAE" },
                            { code: "sa", name: "Saudi Arabia" },
                            { code: "eg", name: "Egypt" },
                            { code: "qa", name: "Qatar" },
                            { code: "bh", name: "Bahrain" },
                            { code: "kw", name: "Kuwait" },
                          ].map((country) => (
                            <div key={country.code} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={country.code}
                                checked={form.watch("newsCountries")?.includes(country.code)}
                                onChange={(e) => {
                                  const current = form.getValues("newsCountries") || [];
                                  if (e.target.checked) {
                                    form.setValue("newsCountries", [...current, country.code]);
                                  } else {
                                    form.setValue("newsCountries", current.filter(c => c !== country.code));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={country.code} className="text-sm">
                                {country.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="keywords" className="text-base font-medium">News Discovery Keywords</Label>
                        <Input
                          id="keywords"
                          placeholder="media, technology, business, government, AI, digital transformation"
                          value={form.watch("newsKeywords")?.join(", ") || ""}
                          onChange={(e) => {
                            const keywords = e.target.value.split(",").map(k => k.trim()).filter(k => k);
                            form.setValue("newsKeywords", keywords);
                          }}
                          className="mt-2"
                        />
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-600">
                            Target keywords for news aggregation from Middle East sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Suggested:</span>
                            {["media monitoring", "digital governance", "smart cities", "fintech", "cybersecurity", "blockchain", "e-commerce"].map(keyword => (
                              <button
                                key={keyword}
                                type="button"
                                onClick={() => {
                                  const current = form.watch("newsKeywords") || [];
                                  if (!current.includes(keyword)) {
                                    form.setValue("newsKeywords", [...current, keyword]);
                                  }
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                + {keyword}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Content Settings */}
                {activeSection === "ai" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Content Generation</CardTitle>
                      <CardDescription>
                        Configure OpenAI integration for automated content creation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="aiContentEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable AI Content Generation</FormLabel>
                              <FormDescription>
                                Use OpenAI to generate SEO-optimized articles from news sources
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seoOptimization"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">SEO Optimization</FormLabel>
                              <FormDescription>
                                Generate meta descriptions, structured data, and SEO-friendly content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label className="text-base font-medium">Content Languages</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="lang-en"
                              checked={form.watch("contentLanguages")?.includes("en")}
                              onChange={(e) => {
                                const current = form.getValues("contentLanguages") || [];
                                if (e.target.checked) {
                                  form.setValue("contentLanguages", [...current, "en"]);
                                } else {
                                  form.setValue("contentLanguages", current.filter(l => l !== "en"));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="lang-en" className="text-sm">English</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="lang-ar"
                              checked={form.watch("contentLanguages")?.includes("ar")}
                              onChange={(e) => {
                                const current = form.getValues("contentLanguages") || [];
                                if (e.target.checked) {
                                  form.setValue("contentLanguages", [...current, "ar"]);
                                } else {
                                  form.setValue("contentLanguages", current.filter(l => l !== "ar"));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="lang-ar" className="text-sm">Arabic</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Email Settings */}
                {activeSection === "email" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Email & Notifications</CardTitle>
                      <CardDescription>
                        Configure email notifications and newsletter automation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Send email alerts for publishing events and system status
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="admin@almstkshf.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address for system notifications and alerts
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newsletterEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Newsletter Automation</FormLabel>
                              <FormDescription>
                                Automatically send weekly newsletters to subscribers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* SEO Settings */}
                {activeSection === "seo" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Configuration</CardTitle>
                      <CardDescription>
                        Configure site-wide SEO settings and metadata
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Almstkshf Media Monitoring" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Leading media monitoring company..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultMetaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Meta Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Default description for pages without specific meta..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Used for pages that don't have a specific meta description
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* System Settings */}
                {activeSection === "system" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>System Configuration</CardTitle>
                      <CardDescription>
                        Advanced system settings and debugging options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="cacheEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Caching</FormLabel>
                              <FormDescription>
                                Cache API responses and content for better performance
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="debugMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Debug Mode</FormLabel>
                              <FormDescription>
                                Enable detailed logging and error reporting
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={false} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg border p-4 bg-amber-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Key className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-amber-800">API Keys Status</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>OpenAI API</span>
                            <Badge variant="default">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>NewsData API</span>
                            <Badge variant="default">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Database</span>
                            <Badge variant="default">Connected</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}