import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  Filter, 
  Download, 
  Waves, 
  Map, 
  BarChart3, 
  Database 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ProfilePlot from '../components/ProfilePlot';
import MapPanel from '../components/MapPanel';
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

const ProfileViewer = () => {
  const { collapsed } = useSidebarStore();

  // Mock data - replace with actual data from your backend
  const mockProfileData = {
    depth: Array.from({ length: 100 }, (_, i) => i * 10),
    temperature: Array.from({ length: 100 }, () => Math.random() * 30),
    salinity: Array.from({ length: 100 }, () => Math.random() * 35 + 30),
    oxygen: Array.from({ length: 100 }, () => Math.random() * 10),
  };

  const mockFloatData = [
    { id: 1, latitude: 20, longitude: -70 },
    { id: 2, latitude: 30, longitude: -60 },
    { id: 3, latitude: 40, longitude: -50 },
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Waves className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                Deep Ocean Profiler
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced marine data visualization and analysis platform for exploring ocean depth profiles
              </p>
            </div>

            {/* Controls */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20">
                      <Filter className="h-4 w-4" />
                      Filter Profiles
                    </Button>
                    <Button variant="outline" className="gap-2 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800">
                      <Waves className="h-4 w-4" />
                      Analyze Profile
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

            <div className="grid grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <Map className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Float Location Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapPanel
                      floatData={mockFloatData}
                      onMarkerClick={(float) => console.log('Float clicked:', float)}
                      className="rounded-lg overflow-hidden min-h-[400px]"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Parameter Profiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ProfilePlot
                      data={mockProfileData}
                      title="Ocean Parameters vs Depth"
                      className="min-h-[500px]"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center">
                      <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Float Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
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
                                  <Map className="h-4 w-4 text-cyan-600" />
                                  <span>20°N, 70°W</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                                  <span>0-2000m depth range</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Database className="h-4 w-4 text-cyan-600" />
                                  <span>Temperature, Salinity, O₂</span>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Button 
                          variant="outline" 
                          className="w-full border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20"
                        >
                          Load More Profiles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center">
                      <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Max Depth</span>
                      <div className="font-mono text-lg font-medium text-cyan-600 dark:text-cyan-400">2000m</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Temperature</span>
                      <div className="font-mono text-lg font-medium text-cyan-600 dark:text-cyan-400">4-28°C</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Salinity</span>
                      <div className="font-mono text-lg font-medium text-cyan-600 dark:text-cyan-400">34-36 PSU</div>
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

export default ProfileViewer;