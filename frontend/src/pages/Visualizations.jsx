import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Map, 
  BarChart3, 
  LineChart, 
  PieChart,
  Download,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import useSidebarStore from '../store/sidebarStore';

const Visualizations = () => {
  const { collapsed } = useSidebarStore();
  const [activeChart, setActiveChart] = useState('temperature');

  const visualizations = [
    {
      id: 'temperature',
      title: 'Temperature Distribution',
      type: 'map',
      icon: <Map className="h-5 w-5" />,
      description: 'Global ocean temperature visualization'
    },
    {
      id: 'currents',
      title: 'Ocean Currents',
      type: 'flow',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Current velocity and direction patterns'
    },
    {
      id: 'salinity',
      title: 'Salinity Levels',
      type: 'heatmap',
      icon: <LineChart className="h-5 w-5" />,
      description: 'Salt concentration across regions'
    },
    {
      id: 'depth',
      title: 'Depth Profiles',
      type: 'chart',
      icon: <PieChart className="h-5 w-5" />,
      description: 'Vertical water column analysis'
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <BarChart3 className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                Visualizations
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Interactive maps, charts, and data visualizations
              </p>
            </div>

            {/* Controls */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {visualizations.map((viz) => (
                    <Button
                      key={viz.id}
                      variant={activeChart === viz.id ? 'default' : 'outline'}
                      onClick={() => setActiveChart(viz.id)}
                      className={`${
                        activeChart === viz.id
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white'
                          : 'border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300'
                      }`}
                    >
                      {viz.icon}
                      <span className="ml-2">{viz.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Visualization Panel */}
              <div className="lg:col-span-3">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      {visualizations.find(v => v.id === activeChart)?.icon}
                      <span className="ml-2">
                        {visualizations.find(v => v.id === activeChart)?.title}
                      </span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-lg h-96 flex items-center justify-center border dark:border-slate-700/50">
                      <div className="text-center">
                        <div className="text-cyan-600 dark:text-cyan-400 mb-4">
                          {visualizations.find(v => v.id === activeChart)?.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-4 mb-2">
                          {visualizations.find(v => v.id === activeChart)?.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          {visualizations.find(v => v.id === activeChart)?.description}
                        </p>
                        <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                          Interactive visualization will load here
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Control Panel */}
              <div className="space-y-6">
                {/* Playback Controls */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Playback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800">
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Range</label>
                      <div className="bg-slate-100 dark:bg-slate-700 rounded p-2 text-sm text-slate-600 dark:text-slate-400">
                        Last 30 days
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed</label>
                      <div className="bg-slate-100 dark:bg-slate-700 rounded p-2 text-sm text-slate-600 dark:text-slate-400">
                        1x Normal
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Layer Controls */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Layers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Temperature</span>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Currents</span>
                      <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-400">Off</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Bathymetry</span>
                      <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-400">Off</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Coastlines</span>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Min Temp:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">-2.1°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Max Temp:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">28.7°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Average:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">15.3°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Data Points:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">2.4M</span>
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

export default Visualizations;