import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Share2, Twitter, Facebook, Linkedin, Copy, Check, Eye, Users } from "lucide-react";

interface SocialShareProps {
  title: string;
  excerpt: string;
  url: string;
  author: string;
  tags?: string[];
  featuredImage?: string;
  readingTime?: number;
}

interface ShareSnippet {
  platform: string;
  text: string;
  hashtags: string[];
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function SocialShare({ title, excerpt, url, author, tags = [], featuredImage, readingTime }: SocialShareProps) {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<ShareSnippet[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);

  // Platform helper functions
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Share2 className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'facebook':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'linkedin':
        return 'bg-blue-700 hover:bg-blue-800';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  useEffect(() => {
    const generateSnippets = () => {
      const baseHashtags = language === "ar" 
        ? ["المستكشف", "ذكاء_الإعلام", "تحليل_البيانات"]
        : ["ALMSTKSHF", "MediaIntelligence", "DataAnalysis"];

      const contentHashtags = tags.slice(0, 3).map(tag => 
        tag.replace(/\s+/g, '').replace(/[^\w\u0600-\u06FF]/g, '')
      );

      const allHashtags = [...baseHashtags, ...contentHashtags];

      const twitterSnippet = {
        platform: "Twitter",
        text: `${title.substring(0, 200)}... ${language === "ar" ? "بقلم" : "by"} ${author}`,
        hashtags: allHashtags.slice(0, 4),
        icon: <Twitter className="w-5 h-5" />,
        color: "bg-blue-500 hover:bg-blue-600",
        description: language === "ar" ? "مشاركة سريعة ومباشرة" : "Quick and direct sharing"
      };

      const linkedinSnippet = {
        platform: "LinkedIn",
        text: `${title}\n\n${excerpt.substring(0, 300)}...\n\n${language === "ar" ? "كاتب المقال:" : "Author:"} ${author}\n\n${language === "ar" ? "اقرأ المقال كاملاً:" : "Read the full article:"}`,
        hashtags: allHashtags.slice(0, 5),
        icon: <Linkedin className="w-5 h-5" />,
        color: "bg-blue-700 hover:bg-blue-800",
        description: language === "ar" ? "مشاركة مهنية مفصلة" : "Professional detailed sharing"
      };

      const facebookSnippet = {
        platform: "Facebook",
        text: `${title}\n\n${excerpt.substring(0, 400)}...\n\n${language === "ar" ? "شاركنا رأيك في التعليقات!" : "Share your thoughts in the comments!"}`,
        hashtags: allHashtags.slice(0, 3),
        icon: <Facebook className="w-5 h-5" />,
        color: "bg-blue-600 hover:bg-blue-700",
        description: language === "ar" ? "مشاركة اجتماعية تفاعلية" : "Interactive social sharing"
      };

      setSnippets([twitterSnippet, linkedinSnippet, facebookSnippet]);
    };

    generateSnippets();
  }, [title, excerpt, author, tags, language]);

  const copyToClipboard = async (text: string, hashtags: string[]) => {
    const fullText = hashtags.length > 0 
      ? `${text}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}\n\n${url}`
      : text; // For direct URL copying
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
        setCopiedText(fullText);
        setTimeout(() => setCopiedText(null), 2000);
        toast({
          title: language === "ar" ? "تم النسخ بنجاح" : "Copied successfully",
          description: language === "ar" ? "تم نسخ النص إلى الحافظة" : "Text copied to clipboard",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopiedText(fullText);
          setTimeout(() => setCopiedText(null), 2000);
          toast({
            title: language === "ar" ? "تم النسخ بنجاح" : "Copied successfully",
            description: language === "ar" ? "تم نسخ النص" : "Text copied",
          });
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: language === "ar" ? "فشل في النسخ" : "Copy failed",
        description: language === "ar" ? "لا يمكن نسخ النص في هذا المتصفح" : "Cannot copy text in this browser",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string, snippet: ShareSnippet) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      const encodedText = encodeURIComponent(snippet.text);
      const encodedUrl = encodeURIComponent(url);
      const encodedHashtags = encodeURIComponent(snippet.hashtags.join(','));

      let shareUrl = '';

      switch (platform.toLowerCase()) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        default:
          toast({
            title: language === "ar" ? "منصة غير مدعومة" : "Platform not supported",
            description: language === "ar" ? "هذه المنصة غير مدعومة حالياً" : "This platform is not currently supported",
            variant: "destructive",
          });
          return;
      }

      const popup = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      
      if (popup && !popup.closed) {
        setShareCount(prev => prev + 1);
        
        // Monitor popup to detect if user actually shares
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Only show success after popup is closed (indicating potential completion)
            setTimeout(() => {
              toast({
                title: language === "ar" ? "تمت المشاركة" : "Shared",
                description: language === "ar" ? `تم فتح ${platform} للمشاركة` : `${platform} opened for sharing`,
              });
            }, 500);
          }
        }, 1000);
        
        // Clean up interval after 30 seconds
        setTimeout(() => {
          clearInterval(checkClosed);
        }, 30000);
      } else {
        toast({
          title: language === "ar" ? "تم حظر النافذة المنبثقة" : "Popup blocked",
          description: language === "ar" ? "يرجى السماح للنوافذ المنبثقة في المتصفح" : "Please allow popups in your browser",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: language === "ar" ? "فشل في المشاركة" : "Share failed",
        description: language === "ar" ? "حدث خطأ أثناء المشاركة" : "An error occurred while sharing",
        variant: "destructive",
      });
    }
  };

  const generatePreview = (snippet: ShareSnippet) => {
    const fullText = `${snippet.text}\n\n${snippet.hashtags.map(tag => `#${tag}`).join(' ')}`;
    const previewLength = snippet.platform === 'Twitter' ? 280 : 500;
    
    return {
      text: fullText.length > previewLength ? fullText.substring(0, previewLength) + '...' : fullText,
      characterCount: fullText.length,
      hashtags: snippet.hashtags
    };
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
          <Share2 className="w-5 h-5" />
          <span>{language === "ar" ? "مشاركة المقال" : "Share Article"}</span>
          {shareCount > 0 && (
            <Badge variant="secondary" className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
              <Users className="w-3 h-3 mr-1" />
              {shareCount}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "ar" 
            ? "اختر المنصة المناسبة لمشاركة هذا المحتوى مع جمهورك"
            : "Choose the right platform to share this content with your audience"
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Article Preview */}
        <Card className="bg-slate-50 border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              {featuredImage && (
                <img 
                  src={featuredImage} 
                  alt={title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerpt}</p>
                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 text-xs text-muted-foreground`}>
                  <span>{language === "ar" ? "بقلم" : "by"} {author}</span>
                  {readingTime && (
                    <span>{readingTime} {language === "ar" ? "دقيقة" : "min read"}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Platform Options */}
        <div className="grid gap-3">
          {snippets.map((snippet) => {
            const preview = generatePreview(snippet);
            const isPreviewOpen = showPreview === snippet.platform;
            
            return (
              <div key={snippet.platform} className="space-y-2">
                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                  <Button
                    onClick={() => shareToSocial(snippet.platform, snippet)}
                    className={`${snippet.color} text-white flex-1 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                    aria-label={`${language === "ar" ? "مشاركة على" : "Share on"} ${snippet.platform}`}
                  >
                    {snippet.icon}
                    <span>{language === "ar" ? "مشاركة على" : "Share on"} {snippet.platform}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(isPreviewOpen ? null : snippet.platform)}
                    aria-label={`${language === "ar" ? "معاينة" : "Preview"} ${snippet.platform} ${language === "ar" ? "المحتوى" : "content"}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(snippet.text, snippet.hashtags)}
                    className={copiedText?.includes(snippet.text) ? "bg-green-50 text-green-700" : ""}
                    aria-label={`${language === "ar" ? "نسخ" : "Copy"} ${snippet.platform} ${language === "ar" ? "النص" : "text"}`}
                  >
                    {copiedText?.includes(snippet.text) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground px-1">{snippet.description}</p>
                
                {/* Preview Card */}
                {isPreviewOpen && (
                  <Card className="bg-slate-50 border-dashed">
                    <CardContent className="p-4">
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-3 mb-3`}>
                        <div className={`w-8 h-8 ${snippet.color} rounded-full flex items-center justify-center text-white`}>
                          {snippet.icon}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{snippet.platform} {language === "ar" ? "معاينة" : "Preview"}</h5>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? "كيف سيظهر المنشور" : "How your post will appear"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {preview.characterCount}/{snippet.platform === 'Twitter' ? '280' : '500'}
                        </Badge>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm whitespace-pre-wrap mb-3">{preview.text}</p>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                          {preview.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="text-xs text-muted-foreground break-all">{url}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Copy URL */}
        <Separator />
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "ar" ? "رابط المقال" : "Article Link"}
          </label>
          <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border rounded-md"
              aria-label={language === "ar" ? "رابط المقال" : "Article URL"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(url, [])}
              className={copiedText === url ? "bg-green-50 text-green-700" : ""}
              aria-label={language === "ar" ? "نسخ الرابط" : "Copy link"}
            >
              {copiedText === url ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}