import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Database, CheckCircle, XCircle, Clock, FileText, HardDrive, Activity, RefreshCw, Eye, Trash2 } from 'lucide-react';
import NetCDFUpload from '@/components/NetCDFUpload';
import { api } from '@/lib/api';

interface Dataset {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  upload_time: string;
  variables: string[];
  dimensions: any;
  value_count: number;
  embedding_count: number;
  uploaded_by: string;
}

const DataManagement = () => {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch datasets from backend
  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets/datasets/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      } else {
        console.error('Failed to fetch datasets');
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh datasets
  const refreshDatasets = async () => {
    setRefreshing(true);
    await fetchDatasets();
    setRefreshing(false);
  };

  // Only fetch datasets when explicitly requested
  // useEffect(() => {
  //   fetchDatasets();
  // }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploaded': return <Upload className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'uploaded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate statistics
  const totalFiles = datasets.length;
  const completedFiles = datasets.filter(d => d.status === 'completed').length;
  const totalRecords = datasets.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.value_count, 0);
  const totalEmbeddings = datasets.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.embedding_count, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Data Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload, process, and manage ARGO float NetCDF files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshDatasets}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload NetCDF File
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload NetCDF Data</DialogTitle>
                <DialogDescription>
                  Upload and process NetCDF files for the oceanographic database
                </DialogDescription>
              </DialogHeader>
              <NetCDFUpload />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">{completedFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records</p>
                <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Embeddings</p>
                <p className="text-2xl font-bold">{totalEmbeddings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <p>Loading datasets...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Files Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {datasets.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No datasets uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload your first NetCDF file to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Embeddings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dataset.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dataset.variables?.length || 0} variables
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dataset.status === 'completed' ? dataset.value_count.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {dataset.status === 'completed' ? dataset.embedding_count.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(dataset.status)}
                          <Badge className={`capitalize ${getStatusColor(dataset.status)}`}>
                            {dataset.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(dataset.upload_time)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {dataset.status === 'failed' && (
                            <Button size="sm" variant="outline">
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">1. Upload</h4>
              <p className="text-xs text-muted-foreground">NetCDF file upload</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold">2. Parse</h4>
              <p className="text-xs text-muted-foreground">Extract metadata</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold">3. Process</h4>
              <p className="text-xs text-muted-foreground">Convert to PostgreSQL</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold">4. Index</h4>
              <p className="text-xs text-muted-foreground">Generate embeddings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
