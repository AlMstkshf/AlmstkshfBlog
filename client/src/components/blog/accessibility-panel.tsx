import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useLanguage } from "@/hooks/use-language";
import { 
  Accessibility, 
  Type, 
  Eye, 
  Minimize2, 
  RotateCcw, 
  Plus, 
  Minus,
  Settings
} from "lucide-react";

interface AccessibilityPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AccessibilityPanel({ isOpen, onToggle }: AccessibilityPanelProps) {
  const { language, isRTL } = useLanguage();
  const {
    settings,
    updateSetting,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    resetToDefaults,
    announceToScreenReader
  } = useAccessibility();

  const handleSettingChange = (setting: string, value: any) => {
    updateSetting(setting as any, value);
    announceToScreenReader(
      language === 'ar' 
        ? `تم تغيير إعداد ${setting}`
        : `${setting} setting changed`
    );
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg"
        aria-label={language === 'ar' ? "فتح لوحة إمكانية الوصول" : "Open accessibility panel"}
      >
        <Accessibility className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50 w-80 shadow-xl max-h-[80vh] overflow-y-auto`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <CardHeader className="pb-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-lg`}>
            <Accessibility className="w-5 h-5" />
            <span>{language === 'ar' ? "إمكانية الوصول" : "Accessibility"}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label={language === 'ar' ? "إغلاق لوحة إمكانية الوصول" : "Close accessibility panel"}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? "تخصيص تجربة القراءة حسب احتياجاتك"
            : "Customize your reading experience"
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Font Size Controls */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <Type className="w-4 h-4" />
              <span className="font-medium">
                {language === 'ar' ? "حجم الخط" : "Font Size"}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {settings.fontSize === 'small' && (language === 'ar' ? 'صغير' : 'Small')}
              {settings.fontSize === 'medium' && (language === 'ar' ? 'متوسط' : 'Medium')}
              {settings.fontSize === 'large' && (language === 'ar' ? 'كبير' : 'Large')}
            </Badge>
          </div>
          
          <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={settings.fontSize === 'small'}
              aria-label={language === 'ar' ? "تصغير الخط" : "Decrease font size"}
              className="flex-1"
            >
              <Minus className="w-4 h-4" />
              <span className={isRTL ? 'mr-2' : 'ml-2'}>
                {language === 'ar' ? "تصغير" : "Smaller"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={settings.fontSize === 'large'}
              aria-label={language === 'ar' ? "تكبير الخط" : "Increase font size"}
              className="flex-1"
            >
              <Plus className="w-4 h-4" />
              <span className={isRTL ? 'mr-2' : 'ml-2'}>
                {language === 'ar' ? "تكبير" : "Larger"}
              </span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Contrast Toggle */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Eye className="w-4 h-4" />
            <div>
              <div className="font-medium">
                {language === 'ar' ? "التباين العالي" : "High Contrast"}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? "تحسين وضوح النص" : "Improve text clarity"}
              </div>
            </div>
          </div>
          <Switch
            checked={settings.contrast === 'high'}
            onCheckedChange={() => {
              toggleHighContrast();
              handleSettingChange(
                'contrast', 
                settings.contrast === 'high' ? 'normal' : 'high'
              );
            }}
            aria-label={language === 'ar' ? "تبديل التباين العالي" : "Toggle high contrast"}
          />
        </div>

        <Separator />

        {/* Reduced Motion Toggle */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Settings className="w-4 h-4" />
            <div>
              <div className="font-medium">
                {language === 'ar' ? "تقليل الحركة" : "Reduced Motion"}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? "تقليل الرسوم المتحركة" : "Minimize animations"}
              </div>
            </div>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={() => {
              toggleReducedMotion();
              handleSettingChange('reducedMotion', !settings.reducedMotion);
            }}
            aria-label={language === 'ar' ? "تبديل تقليل الحركة" : "Toggle reduced motion"}
          />
        </div>

        <Separator />

        {/* Focus Indicators */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Eye className="w-4 h-4" />
            <div>
              <div className="font-medium">
                {language === 'ar' ? "مؤشرات التركيز" : "Focus Indicators"}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? "إبراز العناصر المحددة" : "Highlight focused elements"}
              </div>
            </div>
          </div>
          <Switch
            checked={settings.focusVisible}
            onCheckedChange={(checked) => handleSettingChange('focusVisible', checked)}
            aria-label={language === 'ar' ? "تبديل مؤشرات التركيز" : "Toggle focus indicators"}
          />
        </div>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={() => {
            resetToDefaults();
            announceToScreenReader(
              language === 'ar' 
                ? "تم إعادة تعيين جميع إعدادات إمكانية الوصول"
                : "All accessibility settings have been reset"
            );
          }}
          className={`w-full ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
          aria-label={language === 'ar' ? "إعادة تعيين جميع الإعدادات" : "Reset all settings"}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'ar' ? "إعادة تعيين" : "Reset to Default"}</span>
        </Button>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            {language === 'ar' ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
          </h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{language === 'ar' ? "تكبير الخط" : "Increase font"}</span>
              <code>Ctrl + Plus</code>
            </div>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{language === 'ar' ? "تصغير الخط" : "Decrease font"}</span>
              <code>Ctrl + Minus</code>
            </div>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{language === 'ar' ? "التنقل" : "Navigate"}</span>
              <code>Tab / Shift+Tab</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}