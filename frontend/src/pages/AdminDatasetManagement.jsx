import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, Trash2, Eye, Database } from 'lucide-react';

const AdminDatasetManagement = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
              <Database className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              Dataset Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage datasets and their properties</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-100">
              Upload Dataset
              <Upload className="h-6 w-6 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-slate-400 mb-4">Upload a new dataset to the system.</p>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Upload</Button>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-100">
              Remove Dataset
              <Trash2 className="h-6 w-6 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-slate-400 mb-4">Remove an existing dataset.</p>
            <Button variant="destructive" className="w-full">Remove</Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-100">
              View Datasets
              <Eye className="h-6 w-6 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-slate-400 mb-4">View and manage all datasets.</p>
            <Button variant="outline" className="w-full">View</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDatasetManagement;
