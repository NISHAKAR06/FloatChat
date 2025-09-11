import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatButton from '../components/FloatingChatButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Database, 
  Filter, 
  Download, 
  Eye, 
  MapPin,
  Calendar,
  Thermometer,
  Waves
} from 'lucide-react';
import { datasets } from '../mock/data';
import useSidebarStore from '../store/sidebarStore';

const Explorer = () => {
  const { collapsed } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
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
                <Database className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                Data Explorer
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Discover and analyze oceanographic datasets from around the world
              </p>
            </div>

            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search datasets, locations, parameters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <Button variant="outline" className="border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Datasets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => setSelectedDataset(dataset)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{dataset.name}</CardTitle>
                        <Badge className={getQualityColor(dataset.quality)}>
                          {dataset.quality}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        {dataset.location}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Data Points:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{dataset.dataPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Source:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{dataset.source}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {dataset.parameters.map((param, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-300">
                              {param}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated: {new Date(dataset.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Statistics */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                  <Waves className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Dataset Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">127</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Datasets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4M</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">89%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">High Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">24h</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Update Frequency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
      
      <FloatingChatButton />
    </div>
  );
};

export default Explorer;