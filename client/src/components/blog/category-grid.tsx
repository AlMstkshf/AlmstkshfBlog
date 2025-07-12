import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { type Category } from "@shared/schema";
import { 
  Building2, 
  BarChart3, 
  Lightbulb, 
  MessageSquare,
  Users,
  Globe,
  Shield,
  TrendingUp 
} from "lucide-react";
import { CategoryCardSkeleton } from "@/components/ui/skeletons";

const iconMap = {
  building: Building2,
  chart: BarChart3,
  lightbulb: Lightbulb,
  message: MessageSquare,
  users: Users,
  globe: Globe,
  shield: Shield,
  trending: TrendingUp,
};

interface CategoryGridProps {
  categories?: Category[];
}

export function CategoryGrid({ categories: propCategories }: CategoryGridProps = {}) {
  const { language, isRTL } = useLanguage();

  const { data: fetchedCategories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !propCategories
  });

  const categories = propCategories || fetchedCategories || [];

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">
          {language === "ar" ? "لا توجد فئات متاحة" : "No categories available"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => {
        const name = language === "ar" && category.nameAr ? category.nameAr : category.nameEn;
        const description = language === "ar" && category.descriptionAr 
          ? category.descriptionAr 
          : category.descriptionEn;

        const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || Building2;

        const categoryUrl = `/${language}/category/${category.slug}`;

        return (
          <Link key={category.id} href={categoryUrl}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">{name}</h3>
                {description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{description}</p>
                )}
                <span className="text-primary font-medium text-sm hover:text-blue-700">
                  {language === "ar" ? "استكشف المقالات →" : "Explore Articles →"}
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
