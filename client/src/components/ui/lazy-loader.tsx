import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Skeleton } from './skeleton';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ComponentType;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
}

/**
 * Advanced lazy loading component with intersection observer
 * Loads content only when it enters the viewport
 */
export function LazyLoader({
  children,
  fallback,
  loadingComponent: LoadingComponent,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  className = ''
}: LazyLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  const shouldRender = triggerOnce ? hasLoaded : isVisible;

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <Suspense fallback={fallback || <DefaultLoader />}>
          {children}
        </Suspense>
      ) : (
        fallback || (LoadingComponent ? <LoadingComponent /> : <DefaultLoader />)
      )}
    </div>
  );
}

function DefaultLoader() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * HOC for lazy loading heavy components
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingFallback?: React.ComponentType
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return function LazyWrappedComponent(props: P) {
    return (
      <LazyLoader loadingComponent={loadingFallback}>
        <LazyComponent {...props} />
      </LazyLoader>
    );
  };
}

/**
 * Progressive image loading component
 */
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  className = '',
  width,
  height,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          )}
        </div>
      )}
      
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          width={width}
          height={height}
        />
      )}
      
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy chart loader specifically for data visualizations
 */
interface LazyChartProps {
  children: React.ReactNode;
  chartTitle?: string;
  isRTL?: boolean;
}

export function LazyChart({ children, chartTitle, isRTL }: LazyChartProps) {
  return (
    <LazyLoader
      fallback={
        <div className={`bg-white rounded-lg shadow-lg p-6 my-8 border ${isRTL ? 'text-right' : 'text-left'}`}>
          {chartTitle && (
            <div className="mb-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          <div className="space-y-2">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      }
      threshold={0.2}
      rootMargin="100px"
    >
      {children}
    </LazyLoader>
  );
}