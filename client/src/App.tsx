import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppWrapper } from "@/components/app-wrapper";
import NotFound from "@/pages/not-found";
import BlogHome from "@/pages/blog-home-simple";
import BlogCategory from "@/pages/blog-category";
import BlogArticle from "@/pages/blog-article";
import ContactPage from "@/pages/contact";
import SearchPage from "@/pages/search";
import PrivacyPolicy from "@/pages/privacy-policy";
import Sitemap from "@/pages/sitemap";
import TermsOfService from "@/pages/terms-of-service";
import CookiesPolicy from "@/pages/cookies-policy";
import DataProtection from "@/pages/data-protection";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCategories from "@/pages/admin/categories";
import AdminSettings from "@/pages/admin/settings";
import ContentStrategyPage from "@/pages/admin/content-strategy";
import Downloads from "@/pages/downloads-minimal";
import AdminDownloads from "@/pages/admin-downloads";
import PlatformAnalysis from "@/pages/platform-analysis";

import { ProtectedRoute } from "@/components/auth/protected-route";
import AutomationDashboard from "@/components/admin/automation-dashboard";

function Router() {
  return (
    <Switch>
      {/* Root redirect to Arabic blog as default */}
      <Route path="/" component={() => <Redirect to="/ar" />} />
      <Route path="/ar" component={BlogHome} />
      <Route path="/en" component={BlogHome} />
      
      {/* Admin routes - MUST come first to avoid conflicts */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/content-strategy" component={ContentStrategyPage} />
      <Route path="/admin/automation" component={() => <ProtectedRoute requiredRole="admin"><AutomationDashboard /></ProtectedRoute>} />
      <Route path="/admin/downloads" component={() => <ProtectedRoute requiredRole="admin"><AdminDownloads /></ProtectedRoute>} />
      
      {/* Static pages - MUST come first to avoid conflicts */}
      <Route path="/contact" component={ContactPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/sitemap" component={Sitemap} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/cookies-policy" component={CookiesPolicy} />
      <Route path="/data-protection" component={DataProtection} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/platform-analysis" component={PlatformAnalysis} />
      
      {/* Language-specific static pages */}
      <Route path="/ar/sitemap" component={Sitemap} />
      <Route path="/en/sitemap" component={Sitemap} />
      <Route path="/ar/contact" component={ContactPage} />
      <Route path="/en/contact" component={ContactPage} />
      <Route path="/ar/search" component={SearchPage} />
      <Route path="/en/search" component={SearchPage} />
      <Route path="/ar/privacy-policy" component={PrivacyPolicy} />
      <Route path="/en/privacy-policy" component={PrivacyPolicy} />
      <Route path="/ar/terms-of-service" component={TermsOfService} />
      <Route path="/en/terms-of-service" component={TermsOfService} />
      <Route path="/ar/cookies-policy" component={CookiesPolicy} />
      <Route path="/en/cookies-policy" component={CookiesPolicy} />
      <Route path="/ar/data-protection" component={DataProtection} />
      <Route path="/en/data-protection" component={DataProtection} />
      <Route path="/ar/downloads" component={Downloads} />
      <Route path="/en/downloads" component={Downloads} />
      <Route path="/ar/platform-analysis" component={PlatformAnalysis} />
      <Route path="/en/platform-analysis" component={PlatformAnalysis} />
      

      
      {/* Blog routes */}
      <Route path="/en/blog" component={BlogHome} />
      <Route path="/ar/blog" component={BlogHome} />
      
      {/* Article pages - Specific patterns first */}
      <Route path="/en/blog/:categorySlug/:articleSlug" component={BlogArticle} />
      <Route path="/ar/blog/:categorySlug/:articleSlug" component={BlogArticle} />
      
      {/* Category pages - More general patterns last */}
      <Route path="/en/blog/:slug" component={BlogCategory} />
      <Route path="/ar/blog/:slug" component={BlogCategory} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export { default } from "@/components/stable-app";
