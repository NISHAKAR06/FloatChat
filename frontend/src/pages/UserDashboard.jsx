import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Waves, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Activity,
  MapPin,
  Thermometer,
  Wind,
  Eye
} from 'lucide-react';
import useSidebarStore from '../store/sidebarStore';

const UserDashboard = () => {
  const { collapsed } = useSidebarStore();

  // Mock data
  const stats = [
    {
      title: "Active Datasets",
      value: "127",
      change: "+12%",
      icon: <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      trend: "up"
    },
    {
      title: "Live Sensors",
      value: "2,340",
      change: "+5%",
      icon: <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      trend: "up"
    },
    {
      title: "Active Alerts",
      value: "3",
      change: "-2",
      icon: <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />,
      trend: "down"
    },
    {
      title: "Avg Temperature",
      value: "22.4°C",
      change: "+0.8°C",
      icon: <Thermometer className="h-5 w-5 text-red-500 dark:text-red-400" />,
      trend: "up"
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "Temperature Anomaly",
      location: "Gulf Stream - 40.7°N, 70.2°W",
      severity: "high",
      time: "2 hours ago",
      description: "Temperature spike detected: 3.2°C above normal"
    },
    {
      id: 2,
      type: "Current Shift",
      location: "California Current - 36.8°N, 121.9°W",
      severity: "medium",
      time: "6 hours ago",
      description: "Unusual current velocity changes observed"
    },
    {
      id: 3,
      type: "Salinity Change",
      location: "Labrador Sea - 58.5°N, 52.1°W",
      severity: "low",
      time: "1 day ago",
      description: "Salinity levels 0.5 PSU below seasonal average"
    }
  ];

  const quickActions = [
    { title: "Explore Data", icon: <Eye className="h-4 w-4" />, action: "explorer" },
    { title: "View Maps", icon: <MapPin className="h-4 w-4" />, action: "visualizations" },
    { title: "Create Alert", icon: <AlertTriangle className="h-4 w-4" />, action: "alerts" },
    { title: "Chat with AI", icon: <Waves className="h-4 w-4" />, action: "chat" }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/50';
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Welcome back, Ocean Explorer! 🌊
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
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
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {stat.icon}
                        <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Alerts */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Badge className={`${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{alert.type}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{alert.description}</p>
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="mr-3">{alert.location}</span>
                              <span>{alert.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/20">
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <Button
                          key={action.title}
                          variant="outline"
                          className="w-full justify-start border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:hover:border-cyan-600"
                        >
                          {action.icon}
                          <span className="ml-2">{action.title}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Widget */}
                <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-cyan-100">Ocean Conditions</p>
                        <p className="text-sm text-cyan-200">North Atlantic</p>
                      </div>
                      <Wind className="h-8 w-8 text-cyan-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Wave Height</span>
                        <span className="font-medium">2.4m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Wind Speed</span>
                        <span className="font-medium">15 knots</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Visibility</span>
                        <span className="font-medium">8.2 km</span>
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
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Ocean Data Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Waves className="h-16 w-16 text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Interactive Data Visualization</p>
                      <p className="text-slate-500 dark:text-slate-400">Click "Explore Data" or "View Maps" to see real-time ocean data</p>
                      <Button className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                        Start Exploring
                      </Button>
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