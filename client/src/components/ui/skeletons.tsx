import { Skeleton } from "@/components/ui/skeleton";

export function ArticleHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-12 w-full mb-6" />
      <div className="flex space-x-4 mb-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function ArticleContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function CategoryHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Skeleton className="h-12 w-96 mb-6 bg-blue-200" />
          <Skeleton className="h-6 w-full bg-blue-200" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <Skeleton className="h-4 w-16 mb-3" />
        <Skeleton className="h-6 w-full mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Skeleton className="h-12 w-full mb-6 bg-blue-200" />
            <Skeleton className="h-6 w-full mb-4 bg-blue-200" />
            <Skeleton className="h-6 w-3/4 mb-8 bg-blue-200" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 w-48 bg-white" />
              <Skeleton className="h-12 w-48 bg-blue-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedArticleSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <div className="p-8">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
      <Skeleton className="h-6 w-32 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function NewsletterSkeleton() {
  return (
    <div className="bg-primary text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-6 bg-blue-200" />
        <Skeleton className="h-4 w-96 mx-auto mb-8 bg-blue-200" />
        <div className="flex max-w-md mx-auto">
          <Skeleton className="flex-1 h-12 bg-white mr-2" />
          <Skeleton className="h-12 w-32 bg-blue-200" />
        </div>
      </div>
    </div>
  );
}

export function ContactFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-14 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-12 w-32" />
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-slate-200 pb-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}