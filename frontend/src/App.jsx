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
import ChatAssistant from './pages/ChatAssistant';
import ProfileViewer from './pages/ProfileViewer';
import CompareParameters from './pages/CompareParameters';
// Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
// Pages
import AdminUserManagement from './pages/AdminUserManagement';
// Pages
import AdminUsageAnalytics from './pages/AdminUsageAnalytics';
// Pages
import AdminDatasetManagement from './pages/AdminDatasetManagement';
import SystemMetrics from './pages/SystemMetrics';

// Utils
import ProtectedRoute from './utils/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

const queryClient = new QueryClient();

function App() {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App min-h-screen bg-background">
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
            <Route path="/chat" element={
              <ProtectedRoute role="user">
                <ChatAssistant />
              </ProtectedRoute>
            } />
            <Route path="/profiles" element={
              <ProtectedRoute role="user">
                <ProfileViewer />
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute role="user">
                <CompareParameters />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminUserManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/usage-analytics" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminUsageAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/datasets" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminDatasetManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/system-metrics" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <SystemMetrics />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/metrics" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <div>Metrics</div>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <div>Logs</div>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
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
