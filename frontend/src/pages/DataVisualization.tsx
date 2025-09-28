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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            {/* Mock Chart Placeholder */}
            <div className="h-96 bg-gradient-to-br from-primary/5 to-primary-accent/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {visualizations.find(v => v.id === selectedVisualization)?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('dataVisualization.interactiveChart')}
                </p>
                {selectedVisualization === 'temperature-depth' && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>{t('dataVisualization.sampleData')}</p>
                    <p>{t('dataVisualization.depthRange')}</p>
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
