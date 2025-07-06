import { useEffect } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}