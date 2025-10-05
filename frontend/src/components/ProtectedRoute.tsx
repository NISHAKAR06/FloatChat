import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("user_role");
    
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(userRole === "admin");
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not admin when admin is required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
};

export default ProtectedRoute;
