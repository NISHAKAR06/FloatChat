import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Cpu, HardDrive } from 'lucide-react';

const SystemMetrics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300 p-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
        <Cpu className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        System Metrics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-600" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">CPU usage details will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">Storage usage details will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMetrics;
