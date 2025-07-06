import React, { Suspense } from 'react';
import ErrorBoundary from './error-boundary';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
}

function LoadingFallback({ message = "Loading..." }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Application Error</h1>
            <p className="text-slate-600">
              The application encountered an error. Please refresh the page to continue.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Application
            </Button>
          </div>
        </div>
      }
    >
      <Suspense fallback={<LoadingFallback message="Initializing Al-Mustakshef Platform..." />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}