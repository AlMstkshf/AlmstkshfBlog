import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  fallback 
}: ProtectedRouteProps) {
  const auth = useRequireAuth();

  // Show loading state
  if (auth.isLoading) {
    return fallback || <ProtectedRouteLoading />;
  }

  // Show unauthorized if not authenticated
  if (!auth.isAuthenticated) {
    return <UnauthorizedAccess />;
  }

  // Check role if required
  if (requiredRole && !auth.hasRole(requiredRole)) {
    return <InsufficientPermissions requiredRole={requiredRole} userRole={auth.user?.role} />;
  }

  return <>{children}</>;
}

function ProtectedRouteLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
        <p className="text-sm text-slate-600">Verifying authentication...</p>
      </div>
    </div>
  );
}

function UnauthorizedAccess() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">
            You need to be authenticated to access this page. Please log in to continue.
          </p>
        </div>
      </div>
    </div>
  );
}

interface InsufficientPermissionsProps {
  requiredRole: string;
  userRole?: string;
}

function InsufficientPermissions({ requiredRole, userRole }: InsufficientPermissionsProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <Shield className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Insufficient Permissions</h1>
          <p className="text-slate-600 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>Required role: <span className="font-medium text-slate-700">{requiredRole}</span></p>
            {userRole && (
              <p>Your role: <span className="font-medium text-slate-700">{userRole}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}