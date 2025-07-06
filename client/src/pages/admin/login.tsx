import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield } from "lucide-react";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      role: string;
    };
    accessToken: string;
    expiresIn: string;
  };
  code?: string;
  retryAfter?: number;
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies for refresh token
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Store access token in localStorage
        localStorage.setItem("admin_token", data.data.accessToken);
        localStorage.setItem("admin_user", JSON.stringify(data.data.user));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.data.user.username}!`,
        });
        
        setLocation("/admin/dashboard");
      } else {
        // Handle different error types
        if (data.code === 'RATE_LIMITED') {
          setRateLimited(true);
          setRetryAfter(data.retryAfter || 900); // 15 minutes default
          
          toast({
            title: "Too Many Attempts",
            description: `Please wait ${Math.ceil((data.retryAfter || 900) / 60)} minutes before trying again.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: data.message || "Invalid credentials",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading || rateLimited}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading || rateLimited}
                  required
                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || rateLimited}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>
            
            {rateLimited && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                Too many failed attempts. Please wait {Math.ceil(retryAfter / 60)} minutes before trying again.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:shadow-md" 
              disabled={isLoading || rateLimited}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            Secure admin access with JWT authentication
          </div>
        </CardContent>
      </Card>
    </div>
  );
}