import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Download, BarChart3 } from 'lucide-react';

const AdminUsageAnalytics = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              Usage Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">View and export usage analytics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export as Excel
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Queries per Day/Week/Month</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart */}
            <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Most Frequently Queried Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 dark:text-slate-400">
                <li>Dataset A</li>
                <li>Dataset B</li>
                <li>Dataset C</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Most Used Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 dark:text-slate-400">
                <li>Temperature</li>
                <li>Salinity</li>
                <li>Depth</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-3 bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Top Users (by query volume)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for table */}
            <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Table Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsageAnalytics;
