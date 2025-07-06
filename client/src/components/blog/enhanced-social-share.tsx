import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail,
  MessageCircle,
  ExternalLink,
  Check
} from "lucide-react";

interface EnhancedSocialShareProps {
  title: string;
  excerpt: string;
  url: string;
  author: string;
  featuredImage: string;
  readingTime: number;
  tags: string[];
}

export function EnhancedSocialShare({
  title,
  excerpt,
  url,
  author,
  featuredImage,
  readingTime,
  tags
}: EnhancedSocialShareProps) {
  const { language, isRTL } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Ensure absolute URLs for social sharing
  const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const absoluteImageUrl = featuredImage.startsWith('http') 
    ? featuredImage 
    : `${window.location.origin}${featuredImage}`;

  // Prepare sharing content with proper encoding
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(excerpt || title);
  const shareUrl = encodeURIComponent(absoluteUrl);
  const shareImage = encodeURIComponent(absoluteImageUrl);

  // Enhanced LinkedIn sharing with proper parameters
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${shareTitle}&summary=${shareText}&source=${encodeURIComponent('Al-Mustakshef')}`;
  
  // Twitter with hashtags and mention
  const twitterText = `${title}\n\n${excerpt}\n\n#AlMustakshef #MediaIntelligence #MiddleEast`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${shareUrl}&via=almstkshf`;

  // Facebook sharing with proper Open Graph support
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;

  // Email sharing
  const emailSubject = encodeURIComponent(language === 'ar' 
    ? `مقال مثير للاهتمام: ${title}` 
    : `Interesting Article: ${title}`);
  const emailBody = encodeURIComponent(
    language === 'ar'
      ? `أردت مشاركة هذا المقال المثير للاهتمام معك:\n\n${title}\n\n${excerpt}\n\nاقرأ المقال كاملاً: ${absoluteUrl}\n\nمن: المستكشف - منصة الذكاء الإعلامي`
      : `I wanted to share this interesting article with you:\n\n${title}\n\n${excerpt}\n\nRead the full article: ${absoluteUrl}\n\nFrom: Al-Mustakshef - Middle East Media Intelligence`
  );
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  // WhatsApp sharing
  const whatsappText = language === 'ar'
    ? `${title}\n\n${excerpt}\n\nاقرأ المزيد: ${absoluteUrl}`
    : `${title}\n\n${excerpt}\n\nRead more: ${absoluteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        toast({
          title: language === "ar" ? "تم نسخ الرابط" : "Link copied",
          description: language === "ar" 
            ? "تم نسخ رابط المقال إلى الحافظة" 
            : "Article link copied to clipboard",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = absoluteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        toast({
          title: language === "ar" ? "تم نسخ الرابط" : "Link copied",
          description: language === "ar" 
            ? "تم نسخ رابط المقال" 
            : "Article link copied",
        });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: language === "ar" ? "فشل في النسخ" : "Copy failed",
        description: language === "ar" 
          ? "لا يمكن نسخ الرابط" 
          : "Cannot copy link",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt,
          url: absoluteUrl,
        });
      } catch (error) {
        console.error('Native share failed:', error);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const socialPlatforms = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: linkedinUrl,
      color: 'bg-[#0077B5] hover:bg-[#005885]',
      description: language === 'ar' ? 'شارك على لينكد إن' : 'Share on LinkedIn'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: twitterUrl,
      color: 'bg-[#1DA1F2] hover:bg-[#0d8bd9]',
      description: language === 'ar' ? 'شارك على تويتر' : 'Share on Twitter'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: facebookUrl,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      description: language === 'ar' ? 'شارك على فيسبوك' : 'Share on Facebook'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: whatsappUrl,
      color: 'bg-[#25D366] hover:bg-[#20b358]',
      description: language === 'ar' ? 'شارك على واتساب' : 'Share on WhatsApp'
    },
    {
      name: 'Email',
      icon: Mail,
      url: emailUrl,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: language === 'ar' ? 'شارك عبر البريد الإلكتروني' : 'Share via Email'
    }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'ar' ? 'شارك هذا المقال' : 'Share this article'}
          </h3>
        </div>

        {/* Article Preview for Sharing */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {featuredImage && (
              <img 
                src={absoluteImageUrl} 
                alt={title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                {title}
              </h4>
              <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                {excerpt}
              </p>
              <div className={`flex items-center gap-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{author}</span>
                <span>•</span>
                <span>
                  {readingTime} {language === 'ar' ? 'دقيقة قراءة' : 'min read'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Platform Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors hover:scale-105 transform`}
              title={platform.description}
            >
              <platform.icon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {platform.name}
              </span>
            </a>
          ))}
        </div>

        {/* Copy Link and Native Share */}
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1"
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تم النسخ!' : 'Copied!'}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
              </>
            )}
          </Button>

          {typeof navigator !== 'undefined' && navigator.share && typeof navigator.share === 'function' && (
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'مشاركة' : 'Share'}
            </Button>
          )}
        </div>

        {/* Sharing Stats or Call to Action */}
        <div className={`mt-4 pt-4 border-t border-gray-200 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {language === 'ar' 
              ? 'ساعد في نشر المحتوى المفيد ومشاركة المعرفة' 
              : 'Help spread valuable content and share knowledge'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}