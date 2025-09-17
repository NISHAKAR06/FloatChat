import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const authData = localStorage.getItem('auth');
  console.log('ProtectedRoute:', { role, authData });

  if (!authData) {
    console.log('No auth data found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  try {
    const { isAuthenticated, user } = JSON.parse(authData);
    console.log('Auth Check:', { isAuthenticated, userRole: user?.role, requiredRole: role });

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    if (role && user?.role !== role) {
      console.log('Invalid role, redirecting');
      return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    console.error('Auth data parse error:', error);
    localStorage.removeItem('auth');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
