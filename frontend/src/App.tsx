import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./pages/Chatbot";
import DataVisualization from "./pages/DataVisualization";
import FiltersSearch from "./pages/FiltersSearch";
import ExportOptions from "./pages/ExportOptions";
import SavedFavorites from "./pages/SavedFavorites";
import UserManagement from "./pages/UserManagement";
import DataManagement from "./pages/DataManagement";
import QueryMonitoring from "./pages/QueryMonitoring";
import Analytics from "./pages/Analytics";
import SystemConfig from "./pages/SystemConfig";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing page without layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

              {/* User Dashboard Pages with sidebar - Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboardLayout><UserDashboard /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><UserDashboardLayout><Chatbot /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/data-visualization" element={<ProtectedRoute><UserDashboardLayout><DataVisualization /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/filters-search" element={<ProtectedRoute><UserDashboardLayout><FiltersSearch /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/export-options" element={<ProtectedRoute><UserDashboardLayout><ExportOptions /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/saved-favorites" element={<ProtectedRoute><UserDashboardLayout><SavedFavorites /></UserDashboardLayout></ProtectedRoute>} />

              {/* Admin Pages with admin sidebar - Protected + Admin Only */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/user-management" element={<ProtectedRoute requireAdmin={true}><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
              <Route path="/data-management" element={<ProtectedRoute requireAdmin={true}><AdminLayout><DataManagement /></AdminLayout></ProtectedRoute>} />
              <Route path="/query-monitoring" element={<ProtectedRoute requireAdmin={true}><AdminLayout><QueryMonitoring /></AdminLayout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute requireAdmin={true}><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
              <Route path="/system-config" element={<ProtectedRoute requireAdmin={true}><AdminLayout><SystemConfig /></AdminLayout></ProtectedRoute>} />
              
              {/* Settings accessible to all authenticated users */}
              <Route path="/settings" element={<ProtectedRoute><UserDashboardLayout><Settings /></UserDashboardLayout></ProtectedRoute>} />
              <Route path="/help" element={<Layout><Help /></Layout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
