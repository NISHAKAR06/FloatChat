import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, Map, Activity, TrendingUp, Download } from 'lucide-react';

const DataVisualization = () => {
  const { t } = useLanguage();
  const [selectedVisualization, setSelectedVisualization] = useState('temperature-depth');

  const visualizations = [
    {
      id: 'temperature-depth',
      title: 'Temperature vs Depth Profile',
      type: 'Line Chart',
      icon: LineChart,
      description: 'Vertical temperature distribution'
    },
    {
      id: 'salinity-time',
      title: 'Salinity Time Series',
      type: 'Time Series',
      icon: TrendingUp,
      description: 'Salinity changes over time'
    },
    {
      id: 'float-trajectories',
      title: 'Float Trajectories',
      type: 'Map',
      icon: Map,
      description: 'Geographic movement patterns'
    },
    {
      id: 'oxygen-distribution',
      title: 'Dissolved Oxygen Distribution',
      type: 'Bar Chart',
      icon: BarChart3,
      description: 'Oxygen levels across regions'
    }
  ];

  const mockData = {
    temperature: [22.5, 21.8, 20.2, 18.5, 16.3, 14.1, 12.8, 11.2, 9.5, 8.1],
    depth: [0, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000],
    regions: ['North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic', 'Indian Ocean'],
    counts: [45, 38, 52, 41, 33]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Data Visualization
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive charts and graphs for ARGO float data analysis
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Chart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Types */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Chart Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visualizations.map((viz) => {
              const Icon = viz.icon;
              return (
                <div
                  key={viz.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedVisualization === viz.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedVisualization(viz.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{viz.title}</h3>
                      <p className="text-xs text-muted-foreground">{viz.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {viz.type}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Visualization Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {visualizations.find(v => v.id === selectedVisualization)?.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="last-30-days">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                    <SelectItem value="last-year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mock Chart Placeholder */}
            <div className="h-96 bg-gradient-to-br from-primary/5 to-primary-accent/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {visualizations.find(v => v.id === selectedVisualization)?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Interactive chart will be displayed here
                </p>
                {selectedVisualization === 'temperature-depth' && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>Sample Data: Temperature range 8.1°C - 22.5°C</p>
                    <p>Depth range: 0m - 2000m</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Floats</p>
                <p className="text-2xl font-bold">3,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">15.2°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Map className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regions</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataVisualization;
