import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import Explorer from './pages/Explorer';
import Visualizations from './pages/Visualizations';
import Alert from './pages/Alert';
import AdminDashboard from './pages/AdminDashboard';
import AdminMetrics from './pages/AdminMetrics';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import AdminSettings from './pages/AdminSettings';

// Utils
import ProtectedRoute from './utils/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  const { initializeTheme } = useThemeStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeTheme();
    initializeAuth();
  }, [initializeTheme, initializeAuth]);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* User Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/explorer" element={
              <ProtectedRoute role="user">
                <Explorer />
              </ProtectedRoute>
            } />
            <Route path="/visualizations" element={
              <ProtectedRoute role="user">
                <Visualizations />
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute role="user">
                <Alert />
              </ProtectedRoute>
            } />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/metrics" element={
              <ProtectedRoute role="admin">
                <AdminMetrics />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute role="admin">
                <AdminLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute role="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;