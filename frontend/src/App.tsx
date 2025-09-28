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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* User Dashboard Pages with sidebar */}
              <Route path="/dashboard" element={<UserDashboardLayout><UserDashboard /></UserDashboardLayout>} />
              <Route path="/chatbot" element={<UserDashboardLayout><Chatbot /></UserDashboardLayout>} />
              <Route path="/data-visualization" element={<UserDashboardLayout><DataVisualization /></UserDashboardLayout>} />
              <Route path="/filters-search" element={<UserDashboardLayout><FiltersSearch /></UserDashboardLayout>} />
              <Route path="/export-options" element={<UserDashboardLayout><ExportOptions /></UserDashboardLayout>} />
              <Route path="/saved-favorites" element={<UserDashboardLayout><SavedFavorites /></UserDashboardLayout>} />

              {/* Admin Pages with admin sidebar */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/user-management" element={<AdminLayout><UserManagement /></AdminLayout>} />
              <Route path="/data-management" element={<AdminLayout><DataManagement /></AdminLayout>} />
              <Route path="/query-monitoring" element={<AdminLayout><QueryMonitoring /></AdminLayout>} />

              <Route path="/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
              <Route path="/system-config" element={<AdminLayout><SystemConfig /></AdminLayout>} />
              <Route path="/settings" element={<UserDashboardLayout><Settings /></UserDashboardLayout>} />
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
