import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Activity,
  MapPin,
  BarChart3,
  Filter,
  Download,
  Star,
  TrendingUp,
  Thermometer,
  Waves,
  Droplets
} from 'lucide-react';

const UserDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock data for demonstration
  const recentFloats = [
    { id: 'ARGO_001', lat: 23.5, lng: 67.8, status: 'Active', lastUpdate: '2 hrs ago' },
    { id: 'ARGO_002', lat: -15.2, lng: 125.4, status: 'Active', lastUpdate: '4 hrs ago' },
    { id: 'ARGO_003', lat: 45.7, lng: -30.1, status: 'Maintenance', lastUpdate: '1 day ago' },
  ];

  const quickStats = [
    { label: 'Active Floats', value: '1,247', icon: Activity, color: 'text-green-500' },
    { label: 'Data Points Today', value: '23.4K', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Temperature Avg', value: '15.7°C', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Salinity Avg', value: '34.8 PSU', icon: Droplets, color: 'text-cyan-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.user.title')}
          </h1>
          <p className="text-muted-foreground">
            Monitor and analyze ARGO float data in real-time
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-glass backdrop-blur-sm border-glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Tracking Map */}
          <Card className="lg:col-span-2 bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('dashboard.user.liveTracking')}
              </CardTitle>
              <CardDescription>
                Real-time ARGO float positions and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-depth rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative text-center text-white">
                  <Waves className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-semibold mb-2">Interactive Map</p>
                  <p className="text-sm opacity-80">
                    Map integration will be implemented with Leaflet/Cesium
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 border-white text-white hover:bg-white/10">
                    View Full Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Floats */}
          <Card className="bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFloats.map((float) => (
                  <div key={float.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{float.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {float.lat.toFixed(1)}°, {float.lng.toFixed(1)}°
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={float.status === 'Active' ? 'default' : 'secondary'}>
                        {float.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{float.lastUpdate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card
            className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer"
            onClick={() => navigate('/data-visualization')}
          >
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t('dashboard.user.visualizations')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Create and view data visualizations
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer"
            onClick={() => navigate('/filters-search')}
          >
            <CardContent className="p-6 text-center">
              <Filter className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t('dashboard.user.filters')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Filter by region, time, and parameters
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer"
            onClick={() => navigate('/export-options')}
          >
            <CardContent className="p-6 text-center">
              <Download className="h-12 w-12 text-primary-glow mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t('dashboard.user.exports')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Export data in CSV, NetCDF, ASCII
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer"
            onClick={() => navigate('/saved-favorites')}
          >
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t('dashboard.user.favorites')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage saved queries and favorites
              </p>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default UserDashboard;
