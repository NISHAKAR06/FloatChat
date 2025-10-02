import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Settings,
  Zap,
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Share2,
  BookmarkPlus,
  MoreVertical
} from 'lucide-react';

const UserDashboard = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // State management
  const [selectedRegion, setSelectedRegion] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const quickStats = [
    {
      label: 'Active Floats',
      value: '127',
      change: '+12%',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
    },
    {
      label: 'Data Points Today',
      value: '23.4K',
      change: '+8%',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30'
    },
    {
      label: 'Avg Temperature',
      value: '24.8°C',
      change: '-2%',
      icon: Thermometer,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30'
    },
    {
      label: 'Avg Salinity',
      value: '34.7 PSU',
      change: '+1%',
      icon: Droplets,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30'
    },
  ];

  const regions = [
    'Arabian Sea', 'Bay of Bengal', 'Equator', 'North Pacific', 'South Pacific',
    'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'
  ];

  const recentActivities = [
    { type: 'data', message: 'New temperature data received from Float #5904478', time: '2 min ago', icon: Thermometer },
    { type: 'alert', message: 'Salinity anomaly detected in Arabian Sea region', time: '15 min ago', icon: AlertCircle },
    { type: 'report', message: 'Monthly ocean analysis report generated', time: '1 hour ago', icon: FileText },
    { type: 'system', message: 'ARGO float network updated with 3 new deployments', time: '3 hours ago', icon: Database },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

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
    <div className={`max-w-7xl mx-auto ${isMobile ? 'space-y-4 p-4' : 'space-y-6'}`}>
      {/* Enhanced Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div className={`${isMobile ? 'text-center' : ''}`}>
          <h1 className={`font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${
            isMobile ? 'text-2xl' : 'text-3xl'
          }`}>
            🌊 Ocean Analytics Dashboard
          </h1>
          <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : ''}`}>
            Real-time ARGO float data analysis and insights
          </p>
        </div>
        <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-3`}>
          <Badge variant="secondary" className="flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Activity className="h-3 w-3" />
            127 Active Floats
          </Badge>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            onClick={handleRefresh}
            disabled={refreshing}
            className="relative"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button
            size={isMobile ? "sm" : "sm"}
            onClick={() => navigate('/chatbot')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {isMobile ? 'Chat' : 'AI Chat'}
          </Button>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-6'}`}>
        {quickStats.map((stat, index) => (
          <Card key={index} className={`group bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{stat.label}</p>
                  <p className={`font-bold text-slate-800 dark:text-slate-100 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200`}>
                <div className={`p-2 rounded-full ${
                  activity.type === 'data' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  activity.type === 'alert' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                  activity.type === 'report' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-slate-800 dark:text-slate-100 ${isMobile ? 'text-sm' : ''}`}>
                    {activity.message}
                  </p>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 ${isMobile ? 'mt-1' : 'mt-1'}`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 h-auto' : 'grid-cols-4'} ${isMobile ? 'p-1' : ''}`}>
          <TabsTrigger value="overview" className={`flex items-center gap-2 ${isMobile ? 'flex-col py-2' : ''}`}>
            <Eye className="h-4 w-4" />
            {!isMobile && 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="visualizations" className={`flex items-center gap-2 ${isMobile ? 'flex-col py-2' : ''}`}>
            <BarChart3 className="h-4 w-4" />
            {!isMobile && 'Visualizations'}
          </TabsTrigger>
          <TabsTrigger value="analysis" className={`flex items-center gap-2 ${isMobile ? 'flex-col py-2' : ''}`}>
            <Filter className="h-4 w-4" />
            {!isMobile && 'Analysis'}
          </TabsTrigger>
          {!isMobile && (
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Personalization
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
            {/* Interactive Map */}
            <Card className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Live Ocean Map
                    </CardTitle>
                    <CardDescription>
                      Real-time ARGO float tracking and data visualization
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-64' : 'h-96'} overflow-hidden rounded-lg`}>
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

            {/* Temperature Trends */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperature Trends
                </CardTitle>
                <CardDescription>
                  Last 30 days temperature variations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-48' : 'h-64'} bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="relative">
                      <Thermometer className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">24.8°C</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Average</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900/30">
                        +2.1°C
                      </Badge>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salinity Analysis */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Salinity Analysis
                </CardTitle>
                <CardDescription>
                  Salt concentration patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-48' : 'h-64'} bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <Droplets className="h-16 w-16 mx-auto mb-4 text-cyan-500" />
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">34.7 PSU</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Parts per thousand</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-blue-700 bg-blue-100 dark:bg-blue-900/30">
                        +0.3 PSU
                      </Badge>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
            {/* Enhanced Map */}
            <Card className={`${isMobile ? '' : 'lg:col-span-2'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Interactive Ocean Visualization
                    </CardTitle>
                    <CardDescription>
                      Real-time ARGO float positions and data streams
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-64' : 'h-96'} overflow-hidden rounded-lg`}>
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

            {/* Temperature Profile Chart */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Temperature Profile
                </CardTitle>
                <CardDescription>
                  Depth vs Temperature analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-48' : 'h-64'} bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="relative">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Interactive Chart</p>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Comparison */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Regional Comparison
                </CardTitle>
                <CardDescription>
                  Arabian Sea vs Bay of Bengal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-48' : 'h-64'} bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-muted-foreground mb-2">Comparative Analysis</p>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tools Tab */}
        <TabsContent value="analysis" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
            {/* Enhanced Search & Filters */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Ocean Filters
                </CardTitle>
                <CardDescription>
                  Filter ARGO data by region, time, and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div>
                  <Label className="text-sm font-medium">Ocean Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className={`${isMobile ? 'mt-1' : 'mt-2'}`}>
                      <SelectValue placeholder="Select ocean region..." />
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
                  <Label className="text-sm font-medium">Time Period</Label>
                  <Select defaultValue="last-month">
                    <SelectTrigger className={`${isMobile ? 'mt-1' : 'mt-2'}`}>
                      <SelectValue placeholder="Choose time range..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Data Parameters</Label>
                  <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temp" defaultChecked />
                      <Label htmlFor="temp" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        Temperature
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="salinity" defaultChecked />
                      <Label htmlFor="salinity" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        Salinity
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="oxygen" />
                      <Label htmlFor="oxygen" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Zap className="h-4 w-4 text-blue-500" />
                        Dissolved Oxygen
                      </Label>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters & Analyze
                </Button>
              </CardContent>
            </Card>

            {/* Float Locator */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  ARGO Float Locator
                </CardTitle>
                <CardDescription>
                  Find nearest floats by coordinates
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className={`${isMobile ? 'grid-cols-1 space-y-3' : 'grid grid-cols-2 gap-3'}`}>
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      placeholder="-90 to 90"
                      min="-90"
                      max="90"
                      step="0.0001"
                      className={`${isMobile ? 'mt-1' : 'mt-2'}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      placeholder="-180 to 180"
                      min="-180"
                      max="180"
                      step="0.0001"
                      className={`${isMobile ? 'mt-1' : 'mt-2'}`}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => alert('Searching for nearest floats...')}>
                  <Target className="h-4 w-4 mr-2" />
                  Find Nearest Floats
                </Button>

                {/* Quick Location Buttons */}
                <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex gap-2'}`}>
                  <Button variant="outline" size="sm" onClick={() => alert('Setting coordinates for Arabian Sea')}>
                    <MapPin className="h-3 w-3 mr-1" />
                    Arabian Sea
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Setting coordinates for Bay of Bengal')}>
                    <MapPin className="h-3 w-3 mr-1" />
                    Bay of Bengal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personalization Tab - Desktop Only */}
        {!isMobile && (
          <TabsContent value="personalization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Saved Favorites */}
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Saved Analysis
                  </CardTitle>
                  <CardDescription>
                    Your frequently accessed ocean data queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Temperature Profiles - Indian Ocean</p>
                          <p className="text-sm text-muted-foreground">Accessed yesterday</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Salinity Comparison - Arabian Sea</p>
                          <p className="text-sm text-muted-foreground">Accessed 2 days ago</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Reports */}
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI-Generated Reports
                  </CardTitle>
                  <CardDescription>
                    Automated insights and trend analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Weekly Ocean Trends
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Analysis of temperature and salinity patterns across major ocean regions.
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-2" />
                        Download PDF
                      </Button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-green-500" />
                        Anomaly Detection Report
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Identified unusual patterns in Indian Ocean temperature data.
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserDashboard;
