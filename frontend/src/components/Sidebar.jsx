import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard, 
  Database, 
  Map, 
  Users,
  BarChart3,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Bot,
  MessageCircle
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSidebarStore from '../store/sidebarStore';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const isAdmin = user?.role === 'admin';

  const userMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: Database, label: 'Explorer', path: '/explorer', badge: 'New' },
    { icon: Map, label: 'Visualizations', path: '/visualizations', badge: null },
    { icon: BarChart3, label: 'Profile Viewer', path: '/profiles', badge: null },
    { icon: FileText, label: 'Compare', path: '/compare', badge: null },
    { icon: MessageCircle, label: 'Chat Assistant', path: '/chat', badge: 'AI', fullWidth: true },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', badge: null },
    { icon: Users, label: 'User Management', path: '/admin/users', badge: null },
    { icon: BarChart3, label: 'Usage Analytics', path: '/admin/usage-analytics', badge: null },
    { icon: Database, label: 'Dataset Management', path: '/admin/datasets', badge: null },
    { icon: Activity, label: 'System Metrics', path: '/admin/system-metrics', badge: null },
    { icon: Settings, label: 'Settings', path: '/admin/settings', badge: null }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ width: collapsed ? 64 : 256 }}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 h-[calc(100vh-64px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-700/60 z-40 select-none shadow-sm"
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="w-full h-8 justify-center hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            )}
          </Button>
        </div>

        {/* Role Indicator */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              ) : (
                <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAdmin ? 'Admin Panel' : 'Data Explorer'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.path ? (
                <Link to={item.path}>
                  <Button
                  variant={isActivePath(item.path) ? 'default' : 'ghost'}
                  className={`w-full h-11 transition-all duration-200 group ${
                    isActivePath(item.path)
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-cyan-700 hover:to-blue-800 dark:from-cyan-600/90 dark:to-blue-700/90 dark:hover:from-cyan-700/90 dark:hover:to-blue-800/90'
                      : 'text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/90 dark:text-slate-300 dark:hover:text-cyan-300 dark:hover:bg-slate-800/90'
                  } ${collapsed ? 'justify-center px-2' : 'justify-start px-3'}`}
                >
                  <div className={`flex items-center ${collapsed ? 'w-full justify-center' : 'w-full'}`}>
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            className={`ml-2 text-xs flex-shrink-0 ${
                              isActivePath(item.path)
                                ? 'bg-white/20 text-white hover:bg-white/40'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-900/70'
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Button>
              </Link>
              ) : (
                <Button
                  onClick={item.onClick}
                  variant={isActivePath(item.path) ? 'default' : 'ghost'}
                  className={`w-full h-11 transition-all duration-200 group text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 dark:text-slate-300 dark:hover:text-cyan-400 dark:hover:bg-slate-700/50 ${collapsed ? 'justify-center px-2' : 'justify-start px-3'}`}
                >
                  <div className={`flex items-center ${collapsed ? 'w-full justify-center' : 'w-full'}`}>
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            className="ml-2 text-xs flex-shrink-0 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Button>
              )}
            </motion.div>
          ))}
        </nav>

      </div>
    </motion.div>
  );
};

export default Sidebar;
