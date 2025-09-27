import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Database, CheckCircle, XCircle, Clock, FileText, HardDrive, Activity } from 'lucide-react';

interface DataFile {
  id: string;
  filename: string;
  size: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  recordCount: number;
  dataType: string;
  progress?: number;
}

const DataManagement = () => {
  const { t } = useLanguage();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const dataFiles: DataFile[] = [
    {
      id: '1',
      filename: 'argo_pacific_2024_01.nc',
      size: '245 MB',
      uploadDate: '2024-01-20',
      status: 'completed',
      recordCount: 125000,
      dataType: 'CTD Profiles'
    },
    {
      id: '2',
      filename: 'argo_atlantic_bgc_2024_01.nc',
      size: '189 MB',
      uploadDate: '2024-01-19',
      status: 'processing',
      recordCount: 89000,
      dataType: 'BGC Data',
      progress: 67
    },
    {
      id: '3',
      filename: 'argo_indian_2024_01.nc',
      size: '156 MB',  
      uploadDate: '2024-01-18',
      status: 'completed',
      recordCount: 78000,
      dataType: 'CTD Profiles'
    },
    {
      id: '4',
      filename: 'argo_mediterranean_2024_01.nc',
      size: '98 MB',
      uploadDate: '2024-01-17',
      status: 'failed',
      recordCount: 0,
      dataType: 'CTD Profiles'
    },
    {
      id: '5',
      filename: 'argo_arctic_2024_01.nc',
      size: '67 MB',
      uploadDate: '2024-01-16',
      status: 'completed',
      recordCount: 34000,
      dataType: 'CTD Profiles'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const totalFiles = dataFiles.length;
  const completedFiles = dataFiles.filter(f => f.status === 'completed').length;
  const totalRecords = dataFiles.filter(f => f.status === 'completed').reduce((sum, f) => sum + f.recordCount, 0);
  const totalSize = dataFiles.reduce((sum, f) => sum + parseFloat(f.size.replace(' MB', '')), 0);

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
        <Button onClick={handleUpload} disabled={isUploading} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload NetCDF File
        </Button>
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
                <HardDrive className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      {isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Uploading File...</h3>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processing: {uploadProgress}% - Converting NetCDF to PostgreSQL format
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{file.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.dataType}</Badge>
                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>
                    {file.status === 'completed' ? file.recordCount.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <Badge className={`capitalize ${getStatusColor(file.status)}`}>
                        {file.status}
                      </Badge>
                      {file.status === 'processing' && file.progress && (
                        <span className="text-xs text-muted-foreground">
                          {file.progress}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {file.status === 'failed' && (
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
        </CardContent>
      </Card>

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
