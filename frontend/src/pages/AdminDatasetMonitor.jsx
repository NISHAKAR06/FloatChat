import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Database, 
  AlertTriangle, 
  RefreshCcw, 
  Filter, 
  Clock, 
  Waves,
  FileStack,
  Settings2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useSidebarStore from '../store/sidebarStore';

const AdminDatasetMonitor = () => {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-800/95 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileStack className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      Dataset Monitor
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Monitor and manage ocean data files and processing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800 hover:shadow-md dark:from-cyan-600/90 dark:to-blue-700/90 dark:hover:from-cyan-700/90 dark:hover:to-blue-800/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload NetCDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/30 hover:shadow-lg hover:border-slate-300/80 hover:bg-white/95 dark:hover:bg-slate-800/95 dark:hover:border-slate-600/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-800 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white transition-colors">
                      Total Files
                    </CardTitle>
                    <div className="p-2 bg-slate-100 group-hover:bg-slate-200 dark:bg-cyan-900/20 dark:group-hover:bg-cyan-900/30 rounded-lg transition-colors">
                      <Database className="h-4 w-4 text-slate-700 group-hover:text-slate-900 dark:text-cyan-400 dark:group-hover:text-cyan-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-200">2,543</div>
                    <p className="text-sm text-slate-700 dark:text-slate-400">
                      +12 files in the last 24h
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Validation Issues
                    </CardTitle>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">7</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      3 critical, 4 warnings
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Processing Queue
                    </CardTitle>
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">5</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      ~2 minutes remaining
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                    <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                    Dataset Overview
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600 dark:text-cyan-400 hover:bg-slate-100/90 hover:text-slate-900 active:bg-slate-200 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-cyan-700/50 hover:shadow-sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="files" className="space-y-4">
                    <TabsList className="bg-slate-100/80 dark:bg-slate-800/60">
                      <TabsTrigger 
                        value="files" 
                        className="data-[state=active]:bg-white/95 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border-slate-200/60 hover:bg-white/90 hover:text-slate-900 hover:border-slate-300/60 dark:data-[state=active]:bg-slate-800/90 dark:data-[state=active]:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800/70 transition-all duration-200 border border-transparent hover:shadow-sm"
                      >
                        Files
                      </TabsTrigger>
                      <TabsTrigger 
                        value="validation" 
                        className="data-[state=active]:bg-white/95 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border-slate-200/60 hover:bg-white/90 hover:text-slate-900 hover:border-slate-300/60 dark:data-[state=active]:bg-slate-800/90 dark:data-[state=active]:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800/70 transition-all duration-200 border border-transparent hover:shadow-sm"
                      >
                        Validation
                      </TabsTrigger>
                      <TabsTrigger 
                        value="queue" 
                        className="data-[state=active]:bg-white/95 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border-slate-200/60 hover:bg-white/90 hover:text-slate-900 hover:border-slate-300/60 dark:data-[state=active]:bg-slate-800/90 dark:data-[state=active]:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800/70 transition-all duration-200 border border-transparent hover:shadow-sm"
                      >
                        Queue
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="files" className="space-y-4">
                      <div className="rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/30 bg-white/95 dark:bg-slate-900/95">
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/90 dark:bg-slate-800/50">
                                <TableHead className="font-semibold text-slate-800 dark:text-slate-200">File Name</TableHead>
                                <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Size</TableHead>
                                <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Upload Date</TableHead>
                                <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Status</TableHead>
                                <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="hover:bg-slate-100/90 dark:hover:bg-slate-800/60 transition-colors">
                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">float_12345.nc</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">2.3 MB</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">2025-09-12</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50">
                                    Valid
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus:text-slate-900 active:bg-slate-200/90 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-600/60"
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">float_12346.nc</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">1.8 MB</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">2025-09-12</TableCell>
                                <TableCell>
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors">
                                    Error
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="validation" className="space-y-4">
                      <Card className="bg-white/90 dark:bg-slate-800/90 border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-sm text-slate-800 dark:text-slate-200">Validation Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-slate-600 dark:text-slate-400">Overall Progress</div>
                              <div className="text-slate-800 dark:text-slate-200">89%</div>
                            </div>
                            <Progress value={89} className="bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="queue">
                      <div className="p-4 text-center text-slate-600 dark:text-slate-400">
                        Queue management features coming soon
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDatasetMonitor;