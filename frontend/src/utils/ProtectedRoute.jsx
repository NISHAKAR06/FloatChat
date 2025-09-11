import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  // Check if user is authenticated
  const authData = localStorage.getItem('auth');
  
  if (!authData) {
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, user } = JSON.parse(authData);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user's actual role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;