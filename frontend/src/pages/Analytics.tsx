import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  Activity,
  FileText,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  Database,
  Eye,
  Download,
  Share2,
  Calendar
} from 'lucide-react';

const Analytics = () => {
  const currentPeriod = '30d';

  // Mock analytics data
  const usageStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalQueries: 15678,
    dataExports: 234
  };

  const systemMetrics = [
    {
      title: 'CPU Usage',
      value: 68,
      color: 'bg-green-500',
      trend: '+2.4%',
      trendUp: true
    },
    {
      title: 'Memory Usage',
      value: 54,
      color: 'bg-blue-500',
      trend: '-1.8%',
      trendUp: false
    },
    {
      title: 'Disk I/O',
      value: 42,
      color: 'bg-yellow-500',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Network',
      value: 78,
      color: 'bg-red-500',
      trend: '+1.9%',
      trendUp: true
    }
  ];

  const popularRegions = [
    { region: 'North Pacific', queries: 4321, percentage: 32 },
    { region: 'Indian Ocean', queries: 3897, percentage: 29 },
    { region: 'South Atlantic', queries: 2897, percentage: 21 },
    { region: 'North Atlantic', queries: 2134, percentage: 16 },
    { region: 'Southern Ocean', queries: 429, percentage: 2 }
  ];

  const queryTypes = [
    {
      type: 'Temperature Analysis',
      queries: 4567,
      color: 'bg-blue-500',
      description: 'Temperature-related queries'
    },
    {
      type: 'Salinity Analysis',
      queries: 3987,
      color: 'bg-cyan-500',
      description: 'Salinity data analysis'
    },
    {
      type: 'Float Tracking',
      queries: 3467,
      color: 'bg-purple-500',
      description: 'Float location and movement'
    },
    {
      type: 'Regional Reports',
      queries: 2654,
      color: 'bg-green-500',
      description: 'Regional oceanographic reports'
    }
  ];

  const recentActivity = [
    { user: 'Dr. Sarah Johnson', action: 'Exported temperature dataset (13.2 MB)', time: '2 min ago', type: 'export' },
    { user: 'Alex Rodriguez', action: 'Generated salinity profile for Pacific Ocean', time: '5 min ago', type: 'query' },
    { user: 'Prof. Michael Chen', action: 'Created custom analysis report', time: '8 min ago', type: 'report' },
    { user: 'Dr. Emily Watson', action: 'Downloaded 23 GIS layers', time: '12 min ago', type: 'download' },
    { user: 'System', action: 'Automated backup completed', time: '1 hour ago', type: 'system' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            View usage patterns, system performance, and user insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={currentPeriod} disabled>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{usageStats.activeUsers}</p>
                <p className="text-xs text-green-500">+12% this month</p>
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
                <p className="text-sm text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{usageStats.totalQueries.toLocaleString()}</p>
                <p className="text-xs text-green-500">+8.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Exports</p>
                <p className="text-2xl font-bold">{usageStats.dataExports}</p>
                <p className="text-xs text-green-500">+15%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-500">Healthy</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metric.title}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${metric.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend}
                    </span>
                    <span className="text-sm font-semibold">{metric.value}%</span>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Query Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Query Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queryTypes.map((queryType, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${queryType.color}`}></div>
                    <div>
                      <p className="font-medium">{queryType.type}</p>
                      <p className="text-sm text-muted-foreground">{queryType.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{queryType.queries.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {((queryType.queries / usageStats.totalQueries) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Regions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Most Queried Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularRegions.map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{region.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{region.queries.toLocaleString()}</span>
                      <Badge variant="outline">{region.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded ${
                    activity.type === 'export' ? 'bg-green-100' :
                    activity.type === 'query' ? 'bg-blue-100' :
                    activity.type === 'report' ? 'bg-purple-100' :
                    activity.type === 'download' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'export' ? <Download className="h-3 w-3 text-green-600" /> :
                     activity.type === 'query' ? <Activity className="h-3 w-3 text-blue-600" /> :
                     activity.type === 'report' ? <FileText className="h-3 w-3 text-purple-600" /> :
                     activity.type === 'download' ? <Download className="h-3 w-3 text-orange-600" /> :
                     <Activity className="h-3 w-3 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.user}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Usage Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-primary/5 to-primary-accent/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Usage Trends Chart
              </h3>
              <p className="text-sm text-muted-foreground">
                Interactive chart showing daily queries, user activity, and system performance
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <Badge variant="outline">Queries: {usageStats.totalQueries.toLocaleString()}</Badge>
                <Badge variant="outline">Avg Response: 1.2s</Badge>
                <Badge variant="outline">Success Rate: 97.5%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
