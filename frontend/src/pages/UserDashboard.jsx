import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Waves, 
  TrendingUp, 
  Database, 
  Activity,
  MapPin,
  Thermometer,
  Wind,
  Eye,
  Settings2
} from 'lucide-react';
import useSidebarStore from '../store/sidebarStore';

const UserDashboard = () => {
  const { collapsed } = useSidebarStore();
  const navigate = useNavigate();

  // Navigation handlers
  const handleNavigation = (path) => {
    try {
      // Check if path is valid
      if (!path) {
        console.error('Invalid navigation path');
        return;
      }

      // Map of path aliases to actual routes
      const routeMap = {
        '/explorer': '/explorer',
        '/visualizations': '/visualizations',
        '/chat-assistant': '/chat',
        '/chat': '/chat'
      };
      
      // Get the actual route from the map, or use the original path
      const actualPath = routeMap[path] || path;

      // Log navigation attempt
      console.log(`Navigating to: ${actualPath}`);

      // Use navigate with state to preserve history
      navigate(actualPath, {
        replace: false,
        state: { from: 'dashboard' }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Mock data
  const stats = [
    {
      title: "Active Datasets",
      value: "127",
      change: "+12%",
      icon: <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      trend: "up",
      description: "Total active datasets in system"
    },
    {
      title: "Live Sensors",
      value: "2,340",
      change: "+5%",
      icon: <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      trend: "up",
      description: "Connected monitoring devices"
    },
    {
      title: "Avg Temperature",
      value: "22.4°C",
      change: "+0.8°C",
      icon: <Thermometer className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      trend: "up",
      description: "Global average surface temp"
    }
  ];

  const quickActions = [
    { 
      title: "Explore Data", 
      icon: <Eye className="h-4 w-4" />, 
      action: "/explorer",
      description: "Access and analyze ocean data"
    },
    { 
      title: "View Maps", 
      icon: <MapPin className="h-4 w-4" />, 
      action: "/visualizations",
      description: "Interactive ocean data maps"
    },
    { 
      title: "Chat with AI", 
      icon: <Waves className="h-4 w-4" />, 
      action: "/chat",
      description: "Get AI-powered insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <Waves className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  Welcome back, Ocean Explorer!
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 ml-11">
                Here's what's happening in your ocean data world today
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-cyan-50/90 dark:bg-cyan-900/30 rounded-lg">
                          {stat.icon}
                        </div>
                        <Badge 
                          variant={stat.trend === 'up' ? 'default' : 'secondary'} 
                          className={`text-xs ${
                            stat.trend === 'up' 
                              ? 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300' 
                              : 'bg-slate-100/90 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {stat.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{stat.value}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{stat.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <Button
                          key={action.title}
                          variant="outline"
                          className="w-full justify-start gap-3 bg-white/95 dark:bg-slate-800/95 border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 hover:shadow-sm transition-all"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`Clicked ${action.title}`);
                            handleNavigation(action.action);
                          }}
                          role="link"
                          aria-label={`Go to ${action.title}`}
                        >
                          <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                            {action.icon}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{action.title}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{action.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Ocean Conditions Widget */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white h-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Ocean Conditions</h3>
                        <p className="text-sm text-cyan-100">North Atlantic</p>
                      </div>
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Wind className="h-6 w-6 text-cyan-100" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg">
                        <span className="text-sm text-cyan-100">Wave Height</span>
                        <span className="font-mono text-lg">2.4m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg">
                        <span className="text-sm text-cyan-100">Wind Speed</span>
                        <span className="font-mono text-lg">15 kts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg">
                        <span className="text-sm text-cyan-100">Visibility</span>
                        <span className="font-mono text-lg">8.2 km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Data Visualization Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                    <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                    Ocean Data Overview
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-white/95 dark:bg-slate-800/95 border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 hover:shadow-sm transition-all"
                    onClick={() => handleNavigation('/admin/settings')}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden relative min-h-[300px] border border-cyan-100 dark:border-cyan-800/30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-blue-500/5 to-transparent"></div>
                    <div className="relative h-full flex items-center justify-center p-8">
                      <div className="text-center max-w-lg">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-4 inline-block mb-6 shadow-lg">
                          <Waves className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                          Interactive Data Visualization
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                          Explore real-time ocean data through interactive visualizations, maps, and analytics tools
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <Button 
                            className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800 hover:shadow-lg transition-all"
                            onClick={() => handleNavigation('/explorer')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Start Exploring
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-white/95 dark:bg-slate-800/95 border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 hover:shadow-sm transition-all"
                            onClick={() => handleNavigation('/visualizations')}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
      <FloatingChatButton />
    </div>
  );
};

export default UserDashboard;