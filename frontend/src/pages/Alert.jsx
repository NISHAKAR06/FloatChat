import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  AlertTriangle, 
  Plus, 
  Settings,
  MapPin,
  Clock,
  Thermometer,
  Activity,
  Download
} from 'lucide-react';
import { alerts } from '../mock/data';
import useSidebarStore from '../store/sidebarStore';

const Alerts = () => {
  const { collapsed } = useSidebarStore();
  const [showCreateAlert, setShowCreateAlert] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
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
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                    Alerts & Monitoring
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Monitor ocean conditions and receive real-time alerts
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateAlert(!showCreateAlert)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">3</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Active Alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">15</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">24/7</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Thermometer className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">98%</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts List */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-800 dark:text-slate-200">Recent Alerts</CardTitle>
                    <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="dark:text-slate-400 dark:hover:bg-slate-600">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{alert.type}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{alert.description}</p>
                          
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {alert.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">Threshold: </span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.threshold}</span>
                            </div>
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">Current: </span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.currentValue}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Alert Panel */}
              <div>
                {showCreateAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
                      <CardHeader>
                        <CardTitle className="text-slate-800 dark:text-slate-200">Create New Alert</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="alertName" className="text-slate-700 dark:text-slate-300">Alert Name</Label>
                          <Input id="alertName" placeholder="Temperature Alert" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                          <Label htmlFor="parameter" className="text-slate-700 dark:text-slate-300">Parameter</Label>
                          <Input id="parameter" placeholder="temperature" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                          <Label htmlFor="threshold" className="text-slate-700 dark:text-slate-300">Threshold</Label>
                          <Input id="threshold" placeholder="25.0" type="number" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">Location</Label>
                          <Input id="location" placeholder="Gulf Stream" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800">
                          Create Alert
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                      <Thermometer className="h-4 w-4 mr-2" />
                      Temperature Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                      <Activity className="h-4 w-4 mr-2" />
                      Current Speed Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Anomaly Detection
                    </Button>
                  </CardContent>
                </Card>

                {/* Alert Statistics */}
                <Card className="bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-orange-100">Alert Performance</p>
                        <p className="text-sm text-orange-200">Last 30 days</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Triggered</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Resolved</span>
                        <span className="font-medium">44</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response</span>
                        <span className="font-medium">12 min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      
      <FloatingChatButton />
    </div>
  );
};

export default Alerts;