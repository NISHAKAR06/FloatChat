import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Search, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle, Activity, BarChart3 } from 'lucide-react';

interface QueryLog {
  id: string;
  query: string;
  user: string;
  timestamp: string;
  responseTime: number;
  status: 'success' | 'error' | 'timeout';
  resultCount: number;
  aiModel: string;
}

const QueryMonitoring = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('24h');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryLogs: QueryLog[] = [
    {
      id: '1',
      query: 'Show temperature profiles for Pacific Ocean floats',
      user: 'sarah.johnson@oceanography.edu',
      timestamp: '2024-01-20 14:30:25',
      responseTime: 1250,
      status: 'success',
      resultCount: 1543,
      aiModel: 'GPT-4'
    },
    {
      id: '2',
      query: 'Salinity data for North Atlantic region last 30 days',
      user: 'm.chen@marinelab.org',
      timestamp: '2024-01-20 14:28:15',
      responseTime: 890,
      status: 'success',
      resultCount: 892,
      aiModel: 'GPT-4'
    },
    {
      id: '3',
      query: 'Compare BGC data between Mediterranean and Red Sea',
      user: 'alex.r@student.edu',
      timestamp: '2024-01-20 14:25:10',
      responseTime: 15000,
      status: 'timeout',
      resultCount: 0,
      aiModel: 'GPT-4'
    },
    {
      id: '4',
      query: 'Oxygen depletion zones in tropical regions',
      user: 'e.watson@research.gov',
      timestamp: '2024-01-20 14:20:45',
      responseTime: 2100,
      status: 'success',
      resultCount: 234,
      aiModel: 'QWEN'
    },
    {
      id: '5',
      query: 'Invalid query with malformed parameters',
      user: 'guest@temp.com',
      timestamp: '2024-01-20 14:18:30',
      responseTime: 150,
      status: 'error',
      resultCount: 0,
      aiModel: 'GPT-4'
    }
  ];

  const frequentQueries = [
    { query: 'Temperature profiles', count: 1234, avgResponseTime: 1150 },
    { query: 'Salinity data', count: 987, avgResponseTime: 980 },
    { query: 'Float trajectories', count: 654, avgResponseTime: 1450 },
    { query: 'BGC parameters', count: 543, avgResponseTime: 2100 },
    { query: 'Regional comparisons', count: 432, avgResponseTime: 1890 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'timeout': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 1000) return 'text-green-500';
    if (time < 3000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredLogs = queryLogs.filter(log => 
    statusFilter === 'all' || log.status === statusFilter
  );

  const totalQueries = queryLogs.length;
  const successRate = (queryLogs.filter(q => q.status === 'success').length / totalQueries) * 100;
  const avgResponseTime = queryLogs.reduce((sum, q) => sum + q.responseTime, 0) / totalQueries;
  const errorCount = queryLogs.filter(q => q.status === 'error').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Query Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI query performance, success rates, and usage patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{totalQueries}</p>
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
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Queries</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-xs" title={log.query}>
                          {log.query}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {log.aiModel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{log.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge className={`capitalize ${getStatusColor(log.status)}`}>
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={`font-medium ${getResponseTimeColor(log.responseTime)}`}>
                      {log.responseTime}ms
                    </TableCell>
                    <TableCell>
                      {log.resultCount > 0 ? log.resultCount.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Frequent Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Popular Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frequentQueries.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{item.query}</h4>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: {item.avgResponseTime}ms</span>
                      <span>{((item.count / totalQueries) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(item.count / frequentQueries[0].count) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Response Time Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-500">{'< 1s'}</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">1s - 3s</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500">{'> 3s'}</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">AI Model Usage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GPT-4</span>
                  <span>65%</span>
                </div>
                <div className="flex justify-between">
                  <span>QWEN</span>
                  <span>25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mistral</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Error Categories</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Timeout</span>
                  <span>60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Invalid Query</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span>System Error</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueryMonitoring;
