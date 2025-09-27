import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

const UserDashboard = () => {
  // State management
  const [chatMessage, setChatMessage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'bot', message: string}>>([
    { type: 'bot', message: 'Hello! I can help you analyze ARGO float data. Ask questions about temperature, salinity, or ocean regions!' }
  ]);

  // Mock data
  const quickStats = [
    { label: 'Active Floats', value: '1,247', icon: Activity, color: 'text-green-500' },
    { label: 'Data Points Today', value: '23.4K', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Temperature Avg', value: '15.7°C', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Salinity Avg', value: '34.8 PSU', icon: Droplets, color: 'text-cyan-500' },
  ];

  const regions = [
    'Arabian Sea', 'Bay of Bengal', 'Equator', 'North Pacific', 'South Pacific',
    'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'
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
            🌊 FloatChat Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Oceanographic Data Analysis Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            3 Active Floats
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notify on Updates
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
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Maps & Charts
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Analysis Tools
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            My Dashboard
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
                  AI Ocean Analyst
                </CardTitle>
                <CardDescription>
                  Ask natural language questions about ARGO float data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Region Selector */}
                  <div>
                    <Label className="text-sm font-medium">Region Focus</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose region to focus analysis" />
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
                      placeholder="Ask about temperature profiles, salinity patterns, ocean regions..."
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
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export Options */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Export Data</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => alert('Exporting CSV...')}>
                      <FileText className="h-3 w-3 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Exporting NetCDF...')}>
                      <FileText className="h-3 w-3 mr-2" />
                      NetCDF
                    </Button>
                  </div>
                </div>

                {/* Recent Floats */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Recent Float Activity</Label>
                  <div className="space-y-2">
                    <div className="text-center p-4 border rounded">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">ARGO_001</p>
                      <p className="text-xs text-muted-foreground">Bay of Bengal</p>
                      <p className="text-xs">Active - 2h ago</p>
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
                  Live Ocean Map
                </CardTitle>
                <CardDescription>
                  ARGO float positions and regional data visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-b from-blue-50 to-cyan-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative text-center text-black">
                    <Waves className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Interactive Ocean Map</p>
                    <p className="text-sm opacity-80 mb-4">
                      Real-time ARGO float tracking integration
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Thermometer className="h-4 w-4 mr-2" />
                        Temperature Layer
                      </Button>
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Droplets className="h-4 w-4 mr-2" />
                        Salinity Contours
                      </Button>
                      <Button variant="outline" className="border-black text-black hover:bg-black/10">
                        <Target className="h-4 w-4 mr-2" />
                        Float Trajectories
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
                  Temperature Profile
                </CardTitle>
                <CardDescription>
                  Depth vs Time analysis for float data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Temperature Profile Chart</p>
                    <p className="text-xs text-muted-foreground">Data from 2023-2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Regional Comparison
                </CardTitle>
                <CardDescription>
                  Arabian Sea vs Bay of Bengal salinity trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Comparative Analysis</p>
                    <p className="text-xs text-muted-foreground">Arabian Sea: 35.2-36.5 PSU</p>
                    <p className="text-xs text-muted-foreground">Bay of Bengal: 32.5-34.8 PSU</p>
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
                  Advanced Filters
                </CardTitle>
                <CardDescription>
                  Fine-tune your data analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Ocean Regions</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select region" />
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
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Parameters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temp" defaultChecked />
                      <Label htmlFor="temp" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Thermometer className="h-3 w-3" />
                        Temperature
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="salinity" defaultChecked />
                      <Label htmlFor="salinity" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Droplets className="h-3 w-3" />
                        Salinity
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="oxygen" />
                      <Label htmlFor="oxygen" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Droplets className="h-3 w-3" />
                        BGC Oxygen
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
                  Nearest Float Locator
                </CardTitle>
                <CardDescription>
                  Find ARGO floats near specific coordinates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
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
                    <Label htmlFor="longitude">Longitude</Label>
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
                <Button className="w-full" onClick={() => alert('Searching for nearest floats...')}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Nearest Float
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
                  Saved Favorites
                </CardTitle>
                <CardDescription>
                  Your customized queries and analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <p className="font-medium">Chennai Temperature Analysis</p>
                    <p className="text-sm text-muted-foreground">Temperature profiles near Chennai</p>
                    <p className="text-xs text-muted-foreground">Saved yesterday</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Arabian Sea Comparison</p>
                    <p className="text-sm text-muted-foreground">Compare salinity between regions</p>
                    <p className="text-xs text-muted-foreground">Saved 2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  AI-Generated Reports
                </CardTitle>
                <CardDescription>
                  Automated insights and summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      Salinity Trends (June 2024)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Salinity in the Arabian Sea increased by 2.3% compared to last month due to reduced river discharge.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-3 w-3 mr-2" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Temperature Anomalies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Surface temperatures in the Indian Ocean are 1.2°C above seasonal average.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-3 w-3 mr-2" />
                      Download Report
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
