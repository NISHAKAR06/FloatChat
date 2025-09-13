import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  FileText, 
  Search, 
  Download, 
  Filter,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

const AdminLogs = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logType, setLogType] = useState('all');

  const logs = [
    {
      id: 1,
      timestamp: '2024-01-15T10:30:15Z',
      level: 'info',
      category: 'auth',
      message: 'User login successful: user@demo.com',
      details: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0'
    },
    {
      id: 2,
      timestamp: '2024-01-15T10:28:45Z',
      level: 'warning',
      category: 'system',
      message: 'High memory usage detected: 85%',
      details: 'Available memory: 2.4GB, Used: 13.6GB'
    },
    {
      id: 3,
      timestamp: '2024-01-15T10:25:12Z',
      level: 'error',
      category: 'database',
      message: 'Database connection timeout',
      details: 'Connection failed after 30s timeout, retrying...'
    },
    {
      id: 4,
      timestamp: '2024-01-15T10:20:33Z',
      level: 'info',
      category: 'ingestion',
      message: 'Data ingestion completed: Gulf Stream dataset',
      details: '1.2GB processed, 15,420 records added'
    },
    {
      id: 5,
      timestamp: '2024-01-15T10:15:07Z',
      level: 'warning',
      category: 'api',
      message: 'Rate limit exceeded for API key: ***abc123',
      details: 'Requests: 1005/1000 per hour, IP: 203.0.113.42'
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'warning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    System Logs
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">Monitor system activity and troubleshoot issues</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-all hover:shadow-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-all hover:shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:shadow-lg transition-all duration-300 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/95 dark:bg-slate-900/95 border-slate-200/60 hover:border-cyan-300 focus:border-cyan-400 dark:border-slate-600/60 dark:hover:border-cyan-600 dark:focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {['all', 'error', 'warning', 'info'].map((type) => (
                      <Button
                        key={type}
                        variant={logType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogType(type)}
                        className={logType === type ? 
                          'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 
                          'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs List */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-100">
                  <span>Recent Logs</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <div className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-2"></div>
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-4 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getLevelColor(log.level)}>
                            {getLevelIcon(log.level)}
                            <span className="ml-1">{log.level}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {log.category}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">{log.message}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 rounded p-2 font-mono">
                        {log.details}
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-all hover:shadow-sm">
                    Load More Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogs;