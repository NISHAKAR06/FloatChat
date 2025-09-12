import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Database, 
  Activity,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';

const AdminMetrics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const metrics = [
    { title: "API Requests", value: "1.2M", change: "+15%", period: "Today" },
    { title: "Data Processed", value: "45.2 TB", change: "+8%", period: "This Week" },
    { title: "Active Sessions", value: "1,205", change: "+3%", period: "Now" },
    { title: "Error Rate", value: "0.02%", change: "-5%", period: "24h Avg" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    System Metrics
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">Performance analytics and system monitoring</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{metric.title}</p>
                        <Badge variant={metric.change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">{metric.change}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{metric.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{metric.period}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    API Usage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100/30 dark:bg-slate-700/30 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">API Usage Chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100/30 dark:bg-slate-700/30 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Database className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Database Metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminMetrics;