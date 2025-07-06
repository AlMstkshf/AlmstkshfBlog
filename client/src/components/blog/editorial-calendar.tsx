import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Calendar, Clock, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface EditorialCalendarProps {
  isAdmin?: boolean;
}

interface CalendarEvent {
  date: Date;
  articles: ArticleWithCategory[];
  scheduled: number;
  published: number;
}

export function EditorialCalendar({ isAdmin = false }: EditorialCalendarProps) {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const { data: articles } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles", { limit: 100 }],
  });

  useEffect(() => {
    if (!articles) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const events = monthDays.map(date => {
      const dayArticles = articles.filter(article => {
        const publishDate = new Date(article.publishedAt || article.createdAt || Date.now());
        return isSameDay(publishDate, date);
      });

      return {
        date,
        articles: dayArticles,
        scheduled: dayArticles.filter(a => !a.published).length,
        published: dayArticles.filter(a => a.published).length
      };
    });

    setCalendarEvents(events);
  }, [articles, currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    setSelectedDate(null);
  };

  const getEventForDate = (date: Date) => {
    return calendarEvents.find(event => isSameDay(event.date, date));
  };

  const getDayClasses = (date: Date) => {
    const event = getEventForDate(date);
    const baseClasses = "w-full h-20 p-1 border border-slate-200 text-left transition-colors";
    
    let classes = baseClasses;
    
    if (!isSameMonth(date, currentMonth)) {
      classes += " bg-slate-50 text-slate-400";
    } else if (isToday(date)) {
      classes += " bg-blue-50 border-blue-300";
    } else {
      classes += " bg-white hover:bg-slate-50";
    }

    if (selectedDate && isSameDay(date, selectedDate)) {
      classes += " ring-2 ring-primary";
    }

    return classes;
  };

  const locale = language === "ar" ? ar : enUS;
  const monthFormat = language === "ar" ? "MMMM yyyy" : "MMMM yyyy";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {language === "ar" ? "التقويم التحريري" : "Editorial Calendar"}
            </div>
            {isAdmin && (
              <Button disabled size="sm" className="gap-2" title="Article creation requires backend API">
                <Plus className="w-4 h-4" />
                {language === "ar" ? "مقال جديد (معطل)" : "New Article (Disabled)"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-secondary">
              {format(currentMonth, monthFormat, { locale })}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-100 p-2 text-center font-medium text-sm text-slate-600">
                {language === "ar" 
                  ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)]
                  : day
                }
              </div>
            ))}

            {/* Calendar Days */}
            {eachDayOfInterval({
              start: startOfMonth(currentMonth),
              end: endOfMonth(currentMonth)
            }).map(date => {
              const event = getEventForDate(date);
              return (
                <button
                  key={date.toISOString()}
                  className={getDayClasses(date)}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(date, 'd')}
                  </div>
                  
                  {event && (event.published > 0 || event.scheduled > 0) && (
                    <div className="space-y-1">
                      {event.published > 0 && (
                        <div className="text-xs bg-green-100 text-green-700 px-1 rounded">
                          {event.published} {language === "ar" ? "منشور" : "pub"}
                        </div>
                      )}
                      {event.scheduled > 0 && (
                        <div className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                          {event.scheduled} {language === "ar" ? "مجدول" : "sched"}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const event = getEventForDate(selectedDate);
              if (!event || event.articles.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === "ar" ? "لا توجد مقالات في هذا التاريخ" : "No articles scheduled for this date"}</p>
                    {isAdmin && (
                      <Button disabled variant="outline" className="mt-3" size="sm" title="Article creation requires backend API">
                        <Plus className="w-4 h-4 mr-2" />
                        {language === "ar" ? "إضافة مقال (معطل)" : "Add Article (Disabled)"}
                      </Button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {event.articles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary line-clamp-1">
                          {language === "ar" ? article.titleAr : article.titleEn}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {language === "ar" ? article.category?.nameAr : article.category?.nameEn}
                          </Badge>
                          <Badge 
                            variant={article.published ? "default" : "outline"}
                            className="text-xs"
                          >
                            {article.published 
                              ? (language === "ar" ? "منشور" : "Published")
                              : (language === "ar" ? "مسودة" : "Draft")
                            }
                          </Badge>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <Button variant="ghost" size="sm" disabled title="Article editing requires backend API">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Calendar Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
              <span>{language === "ar" ? "مقالات منشورة" : "Published Articles"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
              <span>{language === "ar" ? "مقالات مجدولة" : "Scheduled Articles"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
              <span>{language === "ar" ? "اليوم" : "Today"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}