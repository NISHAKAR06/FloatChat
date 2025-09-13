import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, Trash2, Settings, BarChart3, ArrowDownCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ChartPanel from '../components/ChartPanel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import useSidebarStore from '../store/sidebarStore';

const CompareParameters = () => {
  const { collapsed } = useSidebarStore();

  // Mock data - replace with actual data from your backend
  const mockChartData1 = [{
    x: Array.from({ length: 50 }, (_, i) => i),
    y: Array.from({ length: 50 }, () => Math.random() * 30),
    type: 'scatter',
    name: 'Temperature',
    line: { color: '#0a9396' }
  }];

  const mockChartData2 = [{
    x: Array.from({ length: 50 }, (_, i) => i),
    y: Array.from({ length: 50 }, () => Math.random() * 35 + 30),
    type: 'scatter',
    name: 'Salinity',
    line: { color: '#ee6c4d' }
  }];

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
                <BarChart3 className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                Compare Parameters
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Compare and analyze multiple oceanographic parameters
              </p>
            </div>

            {/* Controls */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20">
                      <Filter className="h-4 w-4" />
                      Filter Data
                    </Button>
                    <Button variant="outline" className="gap-2 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800">
                      <Plus className="h-4 w-4" />
                      Add Chart
                    </Button>
                  </div>
                  <Select defaultValue="latest">
                    <SelectTrigger className="w-[180px] border-cyan-200 dark:border-cyan-700">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest Profiles</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chart Section */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Temperature vs. Depth
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                        Interactive
                      </Badge>
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChartPanel
                      data={mockChartData1}
                      title="Temperature vs. Depth"
                      type="scatter"
                      className="min-h-[400px]"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Salinity vs. Depth
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                        Interactive
                      </Badge>
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChartPanel
                      data={mockChartData2}
                      title="Salinity vs. Depth"
                      type="scatter"
                      className="min-h-[400px]"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Parameter Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select defaultValue="temperature">
                        <SelectTrigger className="w-full border-cyan-200 dark:border-cyan-700">
                          <SelectValue placeholder="Parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="temperature">Temperature</SelectItem>
                          <SelectItem value="salinity">Salinity</SelectItem>
                          <SelectItem value="oxygen">Oxygen</SelectItem>
                          <SelectItem value="pressure">Pressure</SelectItem>
                        </SelectContent>
                      </Select>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="float-1" className="border-cyan-200/50 dark:border-cyan-800/50">
                          <AccordionTrigger className="hover:no-underline py-2">
                            <div className="flex items-center space-x-3">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                              <div>
                                <div className="font-medium">Float #1234</div>
                                <div className="text-xs text-slate-500">Updated: 2h ago</div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 px-5 text-slate-600 dark:text-slate-400">
                              <div className="flex items-center space-x-2">
                                <ArrowDownCircle className="h-4 w-4 text-cyan-600" />
                                <span>0-2000m depth range</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-full justify-start"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Float
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Comparison Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Parameters</span>
                      <Badge variant="outline" className="font-mono">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Depth Range</span>
                      <Badge variant="outline" className="font-mono">0-2000m</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Data Points</span>
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                        2,490
                      </Badge>
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

export default CompareParameters;