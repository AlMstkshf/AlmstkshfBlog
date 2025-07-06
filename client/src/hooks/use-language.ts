import { useState, useEffect } from "react";
import { type Language, getTranslation, type TranslationKey } from "@/lib/i18n";
import { useLocation } from "wouter";

export function useLanguage() {
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize language from URL
    const urlPath = window.location.pathname;
    if (urlPath.startsWith("/ar")) {
      return "ar";
    } else if (urlPath.startsWith("/en")) {
      return "en";
    }
    return "en";
  });

  useEffect(() => {
    // Get language from URL path
    const urlPath = window.location.pathname;
    
    if (urlPath.startsWith("/ar")) {
      setLanguage("ar");
    } else if (urlPath.startsWith("/en")) {
      setLanguage("en");
    } else {
      // For static pages, keep current language
      if (!urlPath.startsWith("/admin") && 
          !urlPath.startsWith("/contact") &&
          !urlPath.startsWith("/search") &&
          !urlPath.startsWith("/privacy") &&
          !urlPath.startsWith("/terms") &&
          !urlPath.startsWith("/cookies") &&
          !urlPath.startsWith("/data-protection") &&
          !urlPath.startsWith("/sitemap")) {
        setLanguage("en");
        setLocation("/en/blog");
      }
    }
  }, [location, setLocation]);

  // Update HTML attributes when language changes
  useEffect(() => {
    const direction = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.className = `lang-${language} dir-${direction}`;
  }, [language]);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    
    // Update URL path and navigate
    const currentPath = window.location.pathname;
    let newPath = currentPath;
    
    if (currentPath.startsWith("/ar") || currentPath.startsWith("/en")) {
      newPath = `/${newLanguage}${currentPath.substring(3)}`;
    } else {
      newPath = `/${newLanguage}${currentPath}`;
    }
    
    // Use wouter's navigation to trigger a re-render
    setLocation(newPath);
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(key, language);
  };

  const isRTL = language === "ar";

  return {
    language,
    changeLanguage,
    t,
    isRTL,
  };
}
