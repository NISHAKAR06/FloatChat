import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Database, Archive, Calendar, MapPin, Thermometer } from 'lucide-react';

const ExportOptions = () => {
  const { t } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedData, setSelectedData] = useState<string[]>(['temperature', 'salinity']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values, compatible with Excel',
      icon: FileText,
      size: '~2.5 MB'
    },
    {
      id: 'netcdf',
      name: 'NetCDF',
      description: 'Network Common Data Form, scientific standard',
      icon: Database,
      size: '~1.8 MB'
    },
    {
      id: 'ascii',
      name: 'ASCII',
      description: 'Plain text format with custom delimiters',
      icon: FileText,
      size: '~3.2 MB'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation, web-friendly',
      icon: Archive,
      size: '~4.1 MB'
    }
  ];

  const dataTypes = [
    { id: 'temperature', label: 'Temperature Data', icon: Thermometer, count: '1,234,567 records' },
    { id: 'salinity', label: 'Salinity Data', icon: Database, count: '1,234,567 records' },
    { id: 'pressure', label: 'Pressure Data', icon: Database, count: '1,234,567 records' },
    { id: 'oxygen', label: 'Dissolved Oxygen', icon: Database, count: '987,654 records' },
    { id: 'ph', label: 'pH Levels', icon: Database, count: '654,321 records' },
    { id: 'chlorophyll', label: 'Chlorophyll Data', icon: Database, count: '543,210 records' },
    { id: 'location', label: 'Location & Trajectory', icon: MapPin, count: '2,468,135 records' },
    { id: 'metadata', label: 'Float Metadata', icon: Archive, count: '3,847 floats' }
  ];

  const recentExports = [
    {
      id: '1',
      filename: 'argo_temperature_2024_01.csv',
      format: 'CSV',
      size: '2.3 MB',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      filename: 'pacific_salinity_data.netcdf',
      format: 'NetCDF',
      size: '1.7 MB',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      filename: 'atlantic_profiles.json',
      format: 'JSON',
      size: '3.8 MB',
      date: '2024-01-13',
      status: 'completed'
    }
  ];

  const toggleDataType = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType)
        ? prev.filter(d => d !== dataType)
        : [...prev, dataType]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv': return FileText;
      case 'netcdf': return Database;
      case 'json': return Archive;
      default: return FileText;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Export Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Download ARGO float data in various formats for analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Download className="h-5 w-5" />
              Configure Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Export Format</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <div
                      key={format.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedFormat === format.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium">{format.name}</h3>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {format.size}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Data Types</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dataTypes.map((dataType) => {
                  const Icon = dataType.icon;
                  return (
                    <div
                      key={dataType.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={dataType.id}
                        checked={selectedData.includes(dataType.id)}
                        onCheckedChange={() => toggleDataType(dataType.id)}
                      />
                      <Icon className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor={dataType.id} className="cursor-pointer font-medium">
                          {dataType.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{dataType.count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t">
              {isExporting ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preparing export...</span>
                    <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              ) : (
                <Button 
                  onClick={handleExport} 
                  className="w-full" 
                  size="lg"
                  disabled={selectedData.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedData.length} Data Type{selectedData.length !== 1 ? 's' : ''} as {selectedFormat.toUpperCase()}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExports.map((export_) => {
                const Icon = getFileIcon(export_.format);
                return (
                  <div key={export_.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{export_.filename}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{export_.format}</Badge>
                        <span className="text-xs text-muted-foreground">{export_.size}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {export_.date}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">CSV Format</h4>
              <p className="text-muted-foreground">
                Best for spreadsheet applications. Includes headers and proper data types.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">NetCDF Format</h4>
              <p className="text-muted-foreground">
                Scientific standard with metadata. Recommended for research use.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Data Quality</h4>
              <p className="text-muted-foreground">
                All exported data includes quality flags and processing information.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">File Limits</h4>
              <p className="text-muted-foreground">
                Maximum export size is 100MB. Use filters to reduce data volume.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportOptions;
