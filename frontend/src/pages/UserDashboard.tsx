import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Activity,
  MessageCircle,
  BarChart3,
  Filter,
  Download,
  Star,
  TrendingUp,
  Thermometer,
  Waves,
  Droplets,
  Send,
  Bot,
  Globe,
  Search,
  FileText,
  Bell,
  Target,
  Heart,
  AlertCircle,
  Shield,
  Database,
  Users,
  Eye,
  Settings
} from 'lucide-react';

const UserDashboard = () => {
  // Use language
  const { t } = useLanguage();

  // State management
  const [selectedRegion, setSelectedRegion] = useState('');

  // Mock data
  const navigate = useNavigate();

  const quickStats = [
    { label: t('dashboard.user.quickStats.activeFloats'), value: t('dashboard.user.oneTwoFourSeven'), icon: Activity, color: 'text-green-500' },
    { label: t('dashboard.user.quickStats.dataPointsToday'), value: t('dashboard.user.twentyThreeFourK'), icon: TrendingUp, color: 'text-blue-500' },
    { label: t('dashboard.user.quickStats.temperatureAvg'), value: t('dashboard.user.fifteenSevenCelsius'), icon: Thermometer, color: 'text-orange-500' },
    { label: t('dashboard.user.quickStats.salinityAvg'), value: t('dashboard.user.thirtyFourEightPSU'), icon: Droplets, color: 'text-cyan-500' },
  ];

  const regions = [
    'Arabian Sea', 'Bay of Bengal', 'Equator', 'North Pacific', 'South Pacific',
    'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'
  ];

  // Add useEffect for Tableau script loading
  useEffect(() => {
    // Load Tableau script dynamically
    const script = document.createElement('script');
    script.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    script.async = true;

    // Add callback to resize after script loads
    script.onload = () => {
      setTimeout(() => {
        const divElement = document.getElementById('viz-dashboard');
        if (divElement) {
          const vizElement = divElement.getElementsByTagName('object')[0];
          if (vizElement && vizElement.style.display !== 'none') {
            if (divElement.offsetWidth > 800) {
              vizElement.style.width = '100%';
              vizElement.style.height = (divElement.offsetWidth * 0.75) + 'px';
            } else if (divElement.offsetWidth > 500) {
              vizElement.style.width = '100%';
              vizElement.style.height = (divElement.offsetWidth * 0.75) + 'px';
            } else {
              vizElement.style.width = '100%';
              vizElement.style.height = '1827px';
            }
          }
        }
      }, 2000); // Increased delay to ensure Tableau loads
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      const existingScript = document.querySelector('script[src="https://public.tableau.com/javascripts/api/viz_v1.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);





  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            🌊 FloatChat {t('dashboard.user.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.user.aiPoweredPlatform')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            {t('dashboard.user.threeActiveFloats')}
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            {t('dashboard.user.notifyOnUpdates')}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="visualizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visualizations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('dashboard.user.tabs.visualizations')}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('dashboard.user.tabs.analysis')}
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t('dashboard.user.tabs.personalization')}
          </TabsTrigger>
        </TabsList>

        {/* Visualization Tab */}
        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Map */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('dashboard.user.liveOceanMap')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.realTimeTracking')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96 overflow-hidden">
                  <div className="tableauPlaceholder" id="viz-dashboard" style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <noscript>
                      <a href="#"><img alt="Indian ARGO Viz" src="https://public.tableau.com/static/images/XH/XH7JBZCM9/1_rss.png" style={{ border: 'none' }} /></a>
                    </noscript>
                    <object className="tableauViz" style={{ display: 'none', width: '100%', height: '100%' }}>
                      <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
                      <param name="embed_code_version" value="3" />
                      <param name="path" value="shared/XH7JBZCM9" />
                      <param name="toolbar" value="yes" />
                      <param name="static_image" value="https://public.tableau.com/static/images/XH/XH7JBZCM9/1.png" />
                      <param name="animate_transition" value="yes" />
                      <param name="display_static_image" value="yes" />
                      <param name="display_spinner" value="yes" />
                      <param name="display_overlay" value="yes" />
                      <param name="display_count" value="yes" />
                      <param name="language" value="en-US" />
                    </object>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('dashboard.user.temperatureProfile')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.depthTime')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t('dashboard.user.temperatureProfileChart')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.dataFrom')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('dashboard.user.regionalComparison')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.arabianvsBay')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t('dashboard.user.comparativeAnalysis')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.arabianSeaRange')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.bayOfBengalRange')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tools Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search & Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t('dashboard.user.advancedFilters')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.oceanRegions')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">{t('dashboard.user.selectRegion')}</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('dashboard.user.selectRegion')} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('dashboard.user.timePeriod')}</Label>
                  <Select defaultValue="last-month">
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('dashboard.user.chooseTimeRange')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-month">{t('dashboard.user.lastMonth')}</SelectItem>
                      <SelectItem value="last-6-months">{t('dashboard.user.last6Months')}</SelectItem>
                      <SelectItem value="last-year">{t('dashboard.user.lastYear')}</SelectItem>
                      <SelectItem value="custom">{t('dashboard.user.customRange')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('dashboard.user.parameters')}</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temp" defaultChecked />
                      <Label htmlFor="temp" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Thermometer className="h-3 w-3" />
                        {t('dashboard.user.temperature')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="salinity" defaultChecked />
                      <Label htmlFor="salinity" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Droplets className="h-3 w-3" />
                        {t('dashboard.user.salinity')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="oxygen" />
                      <Label htmlFor="oxygen" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Droplets className="h-3 w-3" />
                        {t('dashboard.user.bgcOxygen')}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Float Locator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('dashboard.user.nearestFloatLocator')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.latitude')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude">{t('dashboard.user.latitude')}</Label>
                    <Input
                      id="latitude"
                      type="number"
                      placeholder="-90 to 90"
                      min="-90"
                      max="90"
                      step="0.0001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">{t('dashboard.user.longitude')}</Label>
                    <Input
                      id="longitude"
                      type="number"
                      placeholder="-180 to 180"
                      min="-180"
                      max="180"
                      step="0.0001"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => alert(t('dashboard.user.searching'))}>
                  <Search className="h-4 w-4 mr-2" />
                  {t('dashboard.user.findNearestFloat')}
                </Button>
              </CardContent>
            </Card>
          </div>


        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saved Favorites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  {t('dashboard.user.savedFavorites')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.chennaiTemperatureAnalysis')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <p className="font-medium">{t('dashboard.user.temperatureProfilesNear')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.user.savedYesterday')}</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">{t('dashboard.user.arabianSeaComparison')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.user.compareSalinity')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.saved2DaysAgo')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {t('dashboard.user.aiGeneratedReports')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.salinityTrends')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      {t('dashboard.user.salinityTrends')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.user.salinityReportDesc')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-3 w-3 mr-2" />
                      {t('dashboard.user.downloadPDF')}
                    </Button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {t('dashboard.user.temperatureAnomalies')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.user.temperatureReportDesc')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-3 w-3 mr-2" />
                      {t('dashboard.user.downloadReport')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
