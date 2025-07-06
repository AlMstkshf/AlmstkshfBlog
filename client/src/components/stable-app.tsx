import React from 'react';
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "../lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import pages with fallback error handling
const NotFound = React.lazy(() => import("@/pages/not-found"));
const BlogHome = React.lazy(() => import("@/pages/blog-home"));
const BlogCategory = React.lazy(() => import("@/pages/blog-category"));
const BlogArticle = React.lazy(() => import("@/pages/blog-article"));

// Error fallback component
function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Application Error</h1>
        <p className="text-gray-600 mb-4">Something went wrong. Please refresh the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

// Stable router component
function StableRouter() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Root redirect */}
        <Route path="/" component={() => <Redirect to="/en/blog" />} />
        
        {/* Blog home pages */}
        <Route path="/en/blog" component={BlogHome} />
        <Route path="/ar/blog" component={BlogHome} />
        
        {/* Article pages - most specific first */}
        <Route path="/en/blog/:categorySlug/:articleSlug" component={BlogArticle} />
        <Route path="/ar/blog/:categorySlug/:articleSlug" component={BlogArticle} />
        
        {/* Category pages */}
        <Route path="/en/blog/:slug" component={BlogCategory} />
        <Route path="/ar/blog/:slug" component={BlogCategory} />
        
        {/* 404 fallback */}
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  );
}

// Main application component with error boundary
export default function StableApp() {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Application error:', error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <StableRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}