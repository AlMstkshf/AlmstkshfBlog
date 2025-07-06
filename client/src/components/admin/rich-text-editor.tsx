import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Save,
  Eye
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  language: 'en' | 'ar';
}

export function RichTextEditor({ content, onChange, placeholder, language }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (editorRef.current && !previewMode) {
      editorRef.current.innerHTML = content;
    }
  }, [content, previewMode]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const heading = document.createElement(`h${level}`);
        heading.textContent = selectedText;
        heading.className = getHeadingClass(level);
        
        range.deleteContents();
        range.insertNode(heading);
        
        // Move cursor after heading
        const newRange = document.createRange();
        newRange.setStartAfter(heading);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Insert empty heading
        const heading = document.createElement(`h${level}`);
        heading.className = getHeadingClass(level);
        heading.textContent = language === 'ar' ? 'عنوان جديد' : 'New Heading';
        
        range.insertNode(heading);
        
        // Select heading text for editing
        const textRange = document.createRange();
        textRange.selectNodeContents(heading);
        selection.removeAllRanges();
        selection.addRange(textRange);
      }
      
      updateContent();
    }
  };

  const getHeadingClass = (level: number) => {
    const baseClasses = isRTL ? 'text-right' : 'text-left';
    switch (level) {
      case 1: return `text-3xl font-bold mb-4 mt-6 text-gray-900 ${baseClasses}`;
      case 2: return `text-2xl font-semibold mb-3 mt-5 text-gray-800 ${baseClasses}`;
      case 3: return `text-xl font-medium mb-2 mt-4 text-gray-700 ${baseClasses}`;
      default: return baseClasses;
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      execCommand('insertHTML', link);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertImage = async () => {
    if (imageUrl) {
      const img = `<img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto my-4 rounded-lg shadow-sm" />`;
      execCommand('insertHTML', img);
      setImageUrl('');
      setImageAlt('');
      setShowImageDialog(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const img = `<img src="${result.url}" alt="${file.name}" class="max-w-full h-auto my-4 rounded-lg shadow-sm" />`;
        execCommand('insertHTML', img);
        
        toast({
          title: language === 'ar' ? 'تم رفع الصورة' : 'Image uploaded',
          description: language === 'ar' ? 'تم إدراج الصورة بنجاح' : 'Image inserted successfully',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? 'فشل في رفع الصورة' : 'Upload failed',
        description: language === 'ar' ? 'لم نتمكن من رفع الصورة' : 'Could not upload image',
        variant: 'destructive',
      });
    }
  };

  const toolbarButtons = [
    {
      group: 'formatting',
      buttons: [
        { icon: Bold, command: 'bold', title: language === 'ar' ? 'عريض' : 'Bold' },
        { icon: Italic, command: 'italic', title: language === 'ar' ? 'مائل' : 'Italic' },
        { icon: Underline, command: 'underline', title: language === 'ar' ? 'تحته خط' : 'Underline' },
      ]
    },
    {
      group: 'headings',
      buttons: [
        { icon: Heading1, action: () => insertHeading(1), title: language === 'ar' ? 'عنوان رئيسي' : 'Heading 1' },
        { icon: Heading2, action: () => insertHeading(2), title: language === 'ar' ? 'عنوان فرعي' : 'Heading 2' },
        { icon: Heading3, action: () => insertHeading(3), title: language === 'ar' ? 'عنوان فرعي صغير' : 'Heading 3' },
      ]
    },
    {
      group: 'alignment',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', title: language === 'ar' ? 'محاذاة يسار' : 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', title: language === 'ar' ? 'محاذاة وسط' : 'Center' },
        { icon: AlignRight, command: 'justifyRight', title: language === 'ar' ? 'محاذاة يمين' : 'Align Right' },
      ]
    },
    {
      group: 'lists',
      buttons: [
        { icon: List, command: 'insertUnorderedList', title: language === 'ar' ? 'قائمة نقطية' : 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', title: language === 'ar' ? 'قائمة رقمية' : 'Numbered List' },
      ]
    },
    {
      group: 'media',
      buttons: [
        { icon: Link2, action: () => setShowLinkDialog(true), title: language === 'ar' ? 'إدراج رابط' : 'Insert Link' },
        { icon: Image, action: () => fileInputRef.current?.click(), title: language === 'ar' ? 'رفع صورة' : 'Upload Image' },
      ]
    },
    {
      group: 'blocks',
      buttons: [
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: language === 'ar' ? 'اقتباس' : 'Quote' },
        { icon: Code, command: 'formatBlock', value: 'pre', title: language === 'ar' ? 'كود' : 'Code' },
      ]
    },
    {
      group: 'actions',
      buttons: [
        { icon: Undo, command: 'undo', title: language === 'ar' ? 'تراجع' : 'Undo' },
        { icon: Redo, command: 'redo', title: language === 'ar' ? 'إعادة' : 'Redo' },
      ]
    }
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center">
              {group.buttons.map((button, buttonIndex) => (
                <Button
                  key={buttonIndex}
                  variant="ghost"
                  size="sm"
                  title={button.title}
                  onClick={() => {
                    if (button.action) {
                      button.action();
                    } else if (button.command) {
                      execCommand(button.command, button.value);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
              {groupIndex < toolbarButtons.length - 1 && (
                <Separator orientation="vertical" className="mx-1 h-6" />
              )}
            </div>
          ))}
          
          <Separator orientation="vertical" className="mx-1 h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4 mr-1" />
            {language === 'ar' ? 'معاينة' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] p-4">
        {previewMode ? (
          <div 
            className={`prose max-w-none ${isRTL ? 'prose-rtl' : ''}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            onBlur={updateContent}
            className={`min-h-[360px] outline-none prose max-w-none ${isRTL ? 'prose-rtl text-right' : 'text-left'}`}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            suppressContentEditableWarning={true}
            placeholder={placeholder}
          />
        )}
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'إدراج رابط' : 'Insert Link'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">
                  {language === 'ar' ? 'نص الرابط' : 'Link Text'}
                </Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder={language === 'ar' ? 'اضغط هنا' : 'Click here'}
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">
                  {language === 'ar' ? 'عنوان الرابط' : 'URL'}
                </Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                  {language === 'ar' ? 'إدراج' : 'Insert'}
                </Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'إدراج صورة' : 'Insert Image'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">
                  {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">
                  {language === 'ar' ? 'النص البديل' : 'Alt Text'}
                </Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder={language === 'ar' ? 'وصف الصورة' : 'Image description'}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertImage} disabled={!imageUrl}>
                  {language === 'ar' ? 'إدراج' : 'Insert'}
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}