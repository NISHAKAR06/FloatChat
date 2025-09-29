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
      title: t('dataVisualization.temperatureDepthProfile'),
      type: t('dataVisualization.lineChart'),
      icon: LineChart,
      description: t('dataVisualization.verticalTempDistribution')
    },
    {
      id: 'salinity-time',
      title: t('dataVisualization.salinityTimeSeries'),
      type: t('dataVisualization.timeSeries'),
      icon: TrendingUp,
      description: t('dataVisualization.salinityChanges')
    },
    {
      id: 'float-trajectories',
      title: t('dataVisualization.floatTrajectories'),
      type: t('dataVisualization.map'),
      icon: Map,
      description: t('dataVisualization.geographicMovement')
    },
    {
      id: 'oxygen-distribution',
      title: t('dataVisualization.dissolvedOxygen'),
      type: t('dataVisualization.barChart'),
      icon: BarChart3,
      description: t('dataVisualization.oxygenLevels')
    }
  ];

  const mockData = {
    temperature: [22.5, 21.8, 20.2, 18.5, 16.3, 14.1, 12.8, 11.2, 9.5, 8.1],
    depth: [0, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000],
    regions: ['North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic', 'Indian Ocean'],
    counts: [45, 38, 52, 41, 33]
  };

  // Render Temperature vs Depth Line Chart
  const renderTemperatureDepthChart = () => (
    <div className="w-full h-full p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 300" className="border rounded">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y-axis (Temperature) */}
        <text x="15" y="20" fontSize="10" fill="#666">25°C</text>
        <text x="15" y="80" fontSize="10" fill="#666">20°C</text>
        <text x="15" y="140" fontSize="10" fill="#666">15°C</text>
        <text x="15" y="200" fontSize="10" fill="#666">10°C</text>
        <text x="15" y="260" fontSize="10" fill="#666">5°C</text>

        {/* X-axis (Depth) */}
        <text x="60" y="295" fontSize="10" fill="#666">0m</text>
        <text x="120" y="295" fontSize="10" fill="#666">500m</text>
        <text x="180" y="295" fontSize="10" fill="#666">1000m</text>
        <text x="240" y="295" fontSize="10" fill="#666">1500m</text>
        <text x="300" y="295" fontSize="10" fill="#666">2000m</text>

        {/* Temperature curve */}
        <path
          d="M 40 240 Q 80 200 120 160 Q 160 130 200 120 Q 240 110 280 100 Q 320 95 360 90"
          stroke="#2563eb"
          strokeWidth="3"
          fill="none"
        />

        {/* Data points */}
        {[240, 200, 160, 130, 120, 110, 100, 95, 90].map((y, i) => (
          <circle key={i} cx={40 + i * 40} cy={y} r="3" fill="#2563eb" />
        ))}
      </svg>
      <div className="text-sm text-muted-foreground text-center mt-2">
        Temperature decreases gradually with depth (thermocline effect)
      </div>
    </div>
  );

  // Render Salinity Time Series
  const renderSalinityTimeSeriesChart = () => (
    <div className="w-full h-full p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 300" className="border rounded">
        {/* Grid */}
        <defs>
          <pattern id="grid-time" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-time)" />

        {/* Y-axis (Salinity) */}
        <text x="15" y="20" fontSize="10" fill="#666">36 PSU</text>
        <text x="15" y="80" fontSize="10" fill="#666">35 PSU</text>
        <text x="15" y="140" fontSize="10" fill="#666">34 PSU</text>
        <text x="15" y="200" fontSize="10" fill="#666">33 PSU</text>
        <text x="15" y="260" fontSize="10" fill="#666">32 PSU</text>

        {/* Salinity time series */}
        <path
          d="M 40 180 L 80 170 L 120 175 L 160 160 L 200 165 L 240 155 L 280 160 L 320 150 L 360 155"
          stroke="#7c3aed"
          strokeWidth="3"
          fill="none"
        />

        {/* Data points */}
        {[180, 170, 175, 160, 165, 155, 160, 150, 155].map((y, i) => (
          <circle key={i} cx={40 + i * 40} cy={y} r="3" fill="#7c3aed" />
        ))}

        {/* Time labels */}
        <text x="40" y="295" fontSize="10" fill="#666">Jan</text>
        <text x="120" y="295" fontSize="10" fill="#666">Mar</text>
        <text x="200" y="295" fontSize="10" fill="#666">May</text>
        <text x="280" y="295" fontSize="10" fill="#666">Jul</text>
        <text x="360" y="295" fontSize="10" fill="#666">Sep</text>
      </svg>
      <div className="text-sm text-muted-foreground text-center mt-2">
        Salinity fluctuations over time (seasonal variations)
      </div>
    </div>
  );

  // Render Float Trajectories Map
  const renderFloatTrajectoriesMap = () => (
    <div className="w-full h-full p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 300" className="border rounded bg-gradient-to-b from-blue-100 to-blue-300">
        {/* Ocean background */}
        <rect width="400" height="300" fill="url(#ocean-gradient)" />

        {/* Land masses simplified */}
        <path d="M 50 100 L 150 80 L 200 120 L 180 200 L 100 180 Z" fill="#8b5a3c" />
        <path d="M 250 150 L 350 140 L 370 200 L 320 220 L 280 190 Z" fill="#8b5a3c" />

        {/* Float trajectories */}
        <path d="M 100 150 L 120 140 L 150 145 L 180 135 L 220 140" stroke="#dc2626" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
        <path d="M 280 170 L 300 165 L 330 160 L 360 155" stroke="#16a34a" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
        <path d="M 80 200 L 100 190 L 130 185 L 160 175 L 190 170" stroke="#ca8a04" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

        {/* Float positions */}
        <circle cx="220" cy="140" r="5" fill="#dc2626" />
        <circle cx="360" cy="155" r="5" fill="#16a34a" />
        <circle cx="190" cy="170" r="5" fill="#ca8a04" />

        {/* Grid lines for navigation */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
          </marker>
          <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Compass rose */}
        <circle cx="350" cy="50" r="15" fill="none" stroke="#333" strokeWidth="2" />
        <text x="350" y="45" fontSize="12" textAnchor="middle" fill="#333">N</text>
        <text x="365" y="55" fontSize="10" textAnchor="middle" fill="#333">E</text>
        <text x="350" y="70" fontSize="12" textAnchor="middle" fill="#333">S</text>
        <text x="335" y="55" fontSize="10" textAnchor="middle" fill="#333">W</text>
      </svg>
      <div className="text-sm text-muted-foreground text-center mt-2">
        ARGO float trajectories showing movement patterns over 30 days
      </div>
    </div>
  );

  // Render Oxygen Distribution Bar Chart
  const renderOxygenDistributionChart = () => (
    <div className="w-full h-full p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 300" className="border rounded">
        {/* Grid */}
        <defs>
          <pattern id="grid-oxy" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-oxy)" />

        {/* Y-axis */}
        <text x="15" y="20" fontSize="10" fill="#666">8.0</text>
        <text x="15" y="80" fontSize="10" fill="#666">6.0</text>
        <text x="15" y="140" fontSize="10" fill="#666">4.0</text>
        <text x="15" y="200" fontSize="10" fill="#666">2.0</text>
        <text x="15" y="260" fontSize="10" fill="#666">0.0</text>

        {/* Bars for different depth ranges */}
        <rect x="80" y="220" width="25" height="40" fill="#10b981" />
        <rect x="120" y="200" width="25" height="60" fill="#10b981" />
        <rect x="160" y="160" width="25" height="100" fill="#10b981" />
        <rect x="200" y="120" width="25" height="140" fill="#10b981" />
        <rect x="240" y="80" width="25" height="180" fill="#10b981" />
        <rect x="280" y="60" width="25" height="200" fill="#10b981" />

        {/* Bar labels */}
        <text x="87" y="295" fontSize="10" fill="#666" transform="rotate(45 87 295)">0-100m</text>
        <text x="127" y="295" fontSize="10" fill="#666" transform="rotate(45 127 295)">100-500m</text>
        <text x="167" y="295" fontSize="10" fill="#666" transform="rotate(45 167 295)">500-1000m</text>
        <text x="207" y="295" fontSize="10" fill="#666" transform="rotate(45 207 295)">1000-1500m</text>
        <text x="247" y="295" fontSize="10" fill="#666" transform="rotate(45 247 295)">1500-2000m</text>
        <text x="287" y="295" fontSize="10" fill="#666" transform="rotate(45 287 295)">2000-3000m</text>

        {/* Oxygen values on bars */}
        <text x="92" y="215" fontSize="9" fill="white" fontWeight="bold">2.1</text>
        <text x="132" y="195" fontSize="9" fill="white" fontWeight="bold">3.2</text>
        <text x="172" y="155" fontSize="9" fill="white" fontWeight="bold">5.1</text>
        <text x="212" y="115" fontSize="9" fill="white" fontWeight="bold">7.5</text>
        <text x="252" y="75" fontSize="9" fill="white" fontWeight="bold">6.8</text>
        <text x="292" y="55" fontSize="9" fill="white" fontWeight="bold">8.2</text>
      </svg>
      <div className="text-sm text-muted-foreground text-center mt-2">
        Dissolved oxygen levels decrease with depth (oxygen minimum zone around 500-1500m)
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            {t('dataVisualization.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dataVisualization.subtitle')}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t('dataVisualization.exportChart')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Types */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t('dataVisualization.chartTypes')}</CardTitle>
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
                    <SelectItem value="last-7-days">{t('dataVisualization.last7Days')}</SelectItem>
                    <SelectItem value="last-30-days">{t('dataVisualization.last30Days')}</SelectItem>
                    <SelectItem value="last-90-days">{t('dataVisualization.last90Days')}</SelectItem>
                    <SelectItem value="last-year">{t('dataVisualization.lastYear')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mock Charts Based on Visualization Type */}
            <div className="h-96 w-full relative">
              {selectedVisualization === 'temperature-depth' && renderTemperatureDepthChart()}
              {selectedVisualization === 'salinity-time' && renderSalinityTimeSeriesChart()}
              {selectedVisualization === 'float-trajectories' && renderFloatTrajectoriesMap()}
              {selectedVisualization === 'oxygen-distribution' && renderOxygenDistributionChart()}
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
                <p className="text-sm text-muted-foreground">{t('dataVisualization.activeFloats')}</p>
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
                <p className="text-sm text-muted-foreground">{t('dataVisualization.dataPoints')}</p>
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
                <p className="text-sm text-muted-foreground">{t('dataVisualization.avgTemperature')}</p>
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
                <p className="text-sm text-muted-foreground">{t('dataVisualization.regions')}</p>
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
