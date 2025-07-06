import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { Input } from "@/components/ui/input";

export function Header() {
  const [location] = useLocation();
  const { language, isRTL } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.startsWith(path);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navigation = [
    { href: `/${language}/blog`, label: language === "ar" ? "الرئيسية" : "Home" },
    { href: `/${language}/blog/government`, label: language === "ar" ? "القطاع الحكومي" : "Government" },
    { href: `/${language}/blog/business-intelligence`, label: language === "ar" ? "ذكاء الأعمال" : "Business Intelligence" },
    { href: `/${language}/blog/technology-innovation`, label: language === "ar" ? "التكنولوجيا" : "Technology" },
    { href: `/${language}/blog/social-media-analysis`, label: language === "ar" ? "وسائل التواصل" : "Social Media" },
    { href: `/${language}/downloads`, label: language === "ar" ? "التحميلات" : "Downloads" },
    { href: `/contact`, label: language === "ar" ? "تواصل معنا" : "Contact" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${language}/blog`}>
            <div className="flex items-center group cursor-pointer">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                Almstkshf
              </div>
              <span className="text-slate-600 ml-2 text-sm font-medium group-hover:text-primary transition-colors duration-300">
                {language === "ar" ? "مدونة" : "Blog"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-1'}`}>
              {navigation.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  <Link href={item.href} className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md hover:bg-slate-100 hover:text-primary whitespace-nowrap ${
                    isActive(item.href) 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-slate-700"
                  }`}>
                    {item.label}
                  </Link>
                  {index < navigation.length - 1 && (
                    <div className={`w-px h-4 bg-slate-300 ${isRTL ? 'ml-2 mr-2' : 'mx-2'}`} />
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Search, Language Toggle & CTA */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Search */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden sm:flex"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {isSearchOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-80 bg-white border rounded-lg shadow-lg p-3 z-50`}>
                  <form onSubmit={handleSearch}>
                    <Input
                      type="search"
                      placeholder={language === "ar" ? "البحث في المقالات..." : "Search articles..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <LanguageToggle />

            {/* CTA Button */}
            <Link href="/contact?type=demo">
              <Button className="bg-primary text-white hover:bg-blue-700 transition-colors">
                {language === "ar" ? "طلب عرض توضيحي" : "Request Demo"}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right" } className="w-80" dir={isRTL ? "rtl" : "ltr"}>
                <SheetHeader className="sr-only">
                  <SheetTitle>{language === "ar" ? "قائمة التنقل" : "Navigation Menu"}</SheetTitle>
                  <SheetDescription>{language === "ar" ? "قائمة روابط التنقل الرئيسية" : "Main navigation links"}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="pb-4 border-b border-slate-200">
                    <form onSubmit={handleSearch}>
                      <Input
                        type="search"
                        placeholder={language === "ar" ? "البحث في المقالات..." : "Search articles..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigation.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <span className={`block py-3 px-4 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                        }`}>
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
