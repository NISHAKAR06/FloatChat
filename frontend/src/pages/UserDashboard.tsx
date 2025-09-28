import React, { useState } from 'react';
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
  const [chatMessage, setChatMessage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'bot', message: string}>>([
    { type: 'bot', message: t('dashboard.user.helloCanHelp') }
  ]);

  // Mock data
  const navigate = useNavigate();

  const quickStats = [
    { label: t('dashboard.user.quickStats.activeFloats'), value: '1,247', icon: Activity, color: 'text-green-500' },
    { label: t('dashboard.user.quickStats.dataPointsToday'), value: '23.4K', icon: TrendingUp, color: 'text-blue-500' },
    { label: t('dashboard.user.quickStats.temperatureAvg'), value: '15.7°C', icon: Thermometer, color: 'text-orange-500' },
    { label: t('dashboard.user.quickStats.salinityAvg'), value: '34.8 PSU', icon: Droplets, color: 'text-cyan-500' },
  ];

  const regions = [
    'Arabian Sea', 'Bay of Bengal', 'Equator', 'North Pacific', 'South Pacific',
    'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'
  ];

  // Admin panel navigation items
  const adminNavItems = [
    {
      title: t('dashboard.admin.nav.queryMonitoring.title'),
      description: t('dashboard.admin.nav.queryMonitoring.description'),
      icon: Activity,
      url: '/query-monitoring',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      title: t('dashboard.admin.nav.analyticsDashboard.title'),
      description: t('dashboard.admin.nav.analyticsDashboard.description'),
      icon: BarChart3,
      url: '/analytics',
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      title: t('dashboard.admin.nav.systemConfig.title'),
      description: t('dashboard.admin.nav.systemConfig.description'),
      icon: Settings,
      url: '/system-config',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 border-purple-200'
    }
  ];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);

    // Mock AI response based on selected region
    setTimeout(() => {
      let response = 'I found relevant ARGO float data for your query. ';
      if (selectedRegion) {
        response += `Analyzing data from ${selectedRegion} region. `;
      }
      response += 'Here\'s what I discovered about oceanographic patterns.';

      setChatHistory(prev => [...prev, { type: 'bot', message: response }]);
    }, 1000);

    setChatMessage('');
  };

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
            3 Active Floats
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
      <Tabs defaultValue="chatbot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('dashboard.user.tabs.chatbot')}
          </TabsTrigger>
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

        {/* AI Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  {t('dashboard.user.aiOceanAnalyst')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.user.askAbout')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Region Selector */}
                  <div>
                    <Label className="text-sm font-medium">{t('dashboard.user.regionFocus')}</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('dashboard.user.chooseRegion')} />
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

                  {/* Chat Messages */}
                  <div className="h-96 w-full rounded border p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      placeholder={t('dashboard.user.askAbout')}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!chatMessage.trim()} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('dashboard.user.quickActions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export Options */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('dashboard.user.exportData')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => alert(t('dashboard.user.csv'))}>
                      <FileText className="h-3 w-3 mr-2" />
                      {t('dashboard.user.csv')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert(t('dashboard.user.netCDF'))}>
                      <FileText className="h-3 w-3 mr-2" />
                      {t('dashboard.user.netCDF')}
                    </Button>
                  </div>
                </div>

                {/* Recent Floats */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('dashboard.user.recentFloatActivity')}</Label>
                  <div className="space-y-2">
                    <div className="text-center p-4 border rounded">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">ARGO_001</p>
                      <p className="text-xs text-muted-foreground">Bay of Bengal</p>
                      <p className="text-xs">{t('dashboard.user.activeAgo')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
                <div className="h-96 bg-gradient-to-b from-blue-50 to-cyan-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative text-center text-black">
                    <Waves className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">{t('dashboard.user.interactiveOceanMap')}</p>
                    <p className="text-sm opacity-80 mb-4">
                      {t('dashboard.user.realTimeTracking')}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Thermometer className="h-4 w-4 mr-2" />
                        {t('dashboard.user.temperatureLayer')}
                      </Button>
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Droplets className="h-4 w-4 mr-2" />
                        {t('dashboard.user.salinityContours')}
                      </Button>
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Target className="h-4 w-4 mr-2" />
                        {t('dashboard.user.floatTrajectories')}
                      </Button>
                    </div>
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

          {/* Admin Panel Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('dashboard.user.systemAdministration')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.user.access')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminNavItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className={`${item.bgColor} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]`}
                      onClick={() => navigate(item.url)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Icon className={`h-8 w-8 ${item.color}`} />
                        <div>
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.url);
                          }}
                        >
                          {t('dashboard.user.access')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
                      Salinity in the Arabian Sea increased by 2.3% compared to last month due to reduced river discharge.
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
                      Surface temperatures in the Indian Ocean are 1.2°C above seasonal average.
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
