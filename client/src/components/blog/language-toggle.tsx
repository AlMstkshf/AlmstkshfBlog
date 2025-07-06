import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";

export function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    if (newLanguage === language || isAnimating) return;
    
    setIsAnimating(true);
    changeLanguage(newLanguage);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="relative flex items-center bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-1 shadow-sm border border-slate-200/50 overflow-hidden group hover:shadow-md transition-shadow duration-300">
      {/* Animated background indicator */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-white rounded-lg shadow-md transition-all duration-300 ease-out ${
          language === "en" ? "left-1" : "left-[calc(50%+1px)]"
        }`}
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLanguageChange("en")}
        disabled={isAnimating}
        className={`relative z-10 px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
          language === "en"
            ? "text-primary font-semibold"
            : "text-slate-600 hover:text-slate-800"
        }`}
        title="Switch to English"
      >
        <span className="flex items-center gap-2">
          <span className={`text-lg transition-all duration-300 ${
            language === "en" ? "scale-110" : "hover:scale-110"
          }`}>
            🇺🇸
          </span>
          <span className="hidden sm:inline">EN</span>
        </span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLanguageChange("ar")}
        disabled={isAnimating}
        className={`relative z-10 px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
          language === "ar"
            ? "text-primary font-semibold"
            : "text-slate-600 hover:text-slate-800"
        }`}
        title="Switch to Arabic"
      >
        <span className="flex items-center gap-2">
          <span className={`text-lg transition-all duration-300 ${
            language === "ar" ? "scale-110" : "hover:scale-110"
          }`}>
            🇸🇦
          </span>
          <span className="hidden sm:inline">عربي</span>
        </span>
      </Button>
    </div>
  );
}