import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Shield, 
  Users, 
  Database, 
  Activity,
  Server,
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { systemMetrics, users } from '../mock/data';
import useSidebarStore from '../store/sidebarStore';

const AdminDashboard = () => {
  const { collapsed } = useSidebarStore();

  const stats = [
    {
      title: "Total Users",
      value: systemMetrics.activeUsers.toLocaleString(),
      change: "+12%",
      icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      trend: "up"
    },
    {
      title: "System Uptime",
      value: systemMetrics.systemUptime,
      change: "Excellent",
      icon: <Server className="h-5 w-5 text-green-600 dark:text-green-400" />,
      trend: "stable"
    },
    {
      title: "Data Processed",
      value: systemMetrics.dataIngestionRate,
      change: "+8%",
      icon: <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      trend: "up"
    },
    {
      title: "API Calls",
      value: systemMetrics.apiCalls.toLocaleString(),
      change: "+15%",
      icon: <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      trend: "up"
    }
  ];

  const recentUsers = users.slice(0, 5);

  const systemAlerts = [
    {
      id: 1,
      type: "High CPU Usage",
      message: "Database server CPU at 85%",
      severity: "medium",
      time: "10 minutes ago"
    },
    {
      id: 2,
      type: "Storage Warning",
      message: "Storage 75% full - cleanup recommended",
      severity: "low",
      time: "1 hour ago"
    },
    {
      id: 3,
      type: "Failed Login Attempts",
      message: "Multiple failed logins detected",
      severity: "high",
      time: "2 hours ago"
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300';
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                System overview and management controls
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
                        <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs dark:bg-slate-700 dark:text-slate-300">
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
              {/* System Alerts */}
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
                      System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{alert.type}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{alert.message}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20">
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions & Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                        <Database className="h-4 w-4 mr-2" />
                        Database Status
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                        <FileText className="h-4 w-4 mr-2" />
                        View Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                        <Activity className="h-4 w-4 mr-2" />
                        System Health
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Performance */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-green-100">System Performance</p>
                        <p className="text-sm text-green-200">Real-time metrics</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU Usage</span>
                        <span className="font-medium">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Memory</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Storage</span>
                        <span className="font-medium">45%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Recent User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{user.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={user.role === 'admin' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}>
                            {user.role}
                          </Badge>
                          <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-400">
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;