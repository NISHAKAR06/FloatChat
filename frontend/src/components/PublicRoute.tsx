import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already authenticated
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

  // Already authenticated - redirect to appropriate dashboard
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated - allow access to public routes (login/signup)
  return <>{children}</>;
};

export default PublicRoute;
