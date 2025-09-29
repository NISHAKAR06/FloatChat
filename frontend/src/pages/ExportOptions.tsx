import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Database, Archive, Calendar, MapPin, Thermometer, Search, Filter, Globe, Waves, Target, CheckCircle, AlertTriangle } from 'lucide-react';

const ExportOptions = () => {
  const { t } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedData, setSelectedData] = useState<string[]>(['temperature', 'salinity']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Date filtering states
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    quickSelect: 'all'
  });

  // Advanced filtering states
  const [filters, setFilters] = useState({
    // Location filters
    oceans: [] as string[],
    regions: [] as string[],
    latitudeRange: { min: '', max: '' },
    longitudeRange: { min: '', max: '' },

    // Depth/pressure filters
    depthRange: { min: '', max: '' },
    pressureRange: { min: '', max: '' },

    // Float filters
    floatIds: '',
    wmoIds: '',

    // Quality filters
    qualityFlags: [] as string[],
    includeQC: true,
    qcThreshold: 'good',

    // Data filters
    parameters: [] as string[],
    includeMetadata: true
  });

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
            {t('filtersSearch.export.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('filtersSearch.export.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('filtersSearch.export.configureExport')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('filtersSearch.export.filterByDateRange')}
              </Label>
              <div className="space-y-3">
                {/* Quick Select Options */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Time', icon: Calendar },
                    { value: '7d', label: 'Last 7 Days', icon: Calendar },
                    { value: '30d', label: 'Last 30 Days', icon: Calendar },
                    { value: '90d', label: 'Last 90 Days', icon: Calendar },
                    { value: '1y', label: 'Last Year', icon: Calendar },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant={dateRange.quickSelect === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange({
                          ...dateRange,
                          quickSelect: option.value,
                          startDate: '',
                          endDate: ''
                        })}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Custom Date Range */}
                <div className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Filter className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{t('filtersSearch.export.customDateRange')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="start-date" className="text-xs text-muted-foreground">{t('filtersSearch.export.startDate')}</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          startDate: e.target.value,
                          quickSelect: dateRange.startDate || e.target.value ? 'custom' : 'all'
                        })}
                        placeholder="YYYY-MM-DD"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="end-date" className="text-xs text-muted-foreground">{t('filtersSearch.export.endDate')}</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          endDate: e.target.value,
                          quickSelect: dateRange.endDate || e.target.value ? 'custom' : 'all'
                        })}
                        placeholder="YYYY-MM-DD"
                        className="h-9"
                      />
                    </div>
                  </div>
                  {(dateRange.startDate || dateRange.endDate) && (
                    <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <Search className="h-3 w-3" />
                        {t('filtersSearch.export.dateFilterActive')}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('filtersSearch.export.filteringDataFrom')} {dateRange.startDate || 'beginning'} {t('filtersSearch.export.to')} {dateRange.endDate || 'present'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Data Availability Info */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <span className="font-medium text-blue-800">{t('filtersSearch.export.dataAvailable')}:</span>
                    <span className="text-blue-700 ml-1">1990-01-01 to 2024-12-31</span>
                    <span className="text-blue-600 text-xs ml-2">{t('filtersSearch.export.argoDataYears')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('filtersSearch.export.advancedFilters')}
              </Label>

              {/* Filter Pills/Status */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date: {dateRange.quickSelect !== 'all' ? dateRange.quickSelect.toUpperCase() : 'All'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Location: {filters.regions.length > 0 ? `${filters.regions.length} regions` : 'All'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  Depth: {filters.depthRange.min || filters.depthRange.max ? 'Custom' : 'All'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Quality: {filters.qcThreshold}
                </Badge>
              </div>

              {/* Filter Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Location Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t('filtersSearch.export.locationFilters')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Oceans */}
                      <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('filtersSearch.export.oceans')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Atlantic', 'Pacific', 'Indian', 'Southern', 'Arctic'].map((ocean) => (
                          <Button
                            key={ocean}
                            variant={filters.oceans.includes(ocean) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilters({
                              ...filters,
                              oceans: filters.oceans.includes(ocean)
                                ? filters.oceans.filter(o => o !== ocean)
                                : [...filters.oceans, ocean]
                            })}
                            className="h-7 text-xs"
                          >
                            {ocean}
                          </Button>
                        ))}
                      </div>

                      {/* Min/Max Latitude */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('filtersSearch.export.minLatitude')}</Label>
                          <Input
                            type="number"
                            placeholder="-90"
                            min="-90"
                            max="90"
                            value={filters.latitudeRange.min}
                            onChange={(e) => setFilters({
                              ...filters,
                              latitudeRange: { ...filters.latitudeRange, min: e.target.value }
                            })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('filtersSearch.export.maxLatitude')}</Label>
                          <Input
                            type="number"
                            placeholder="90"
                            min="-90"
                            max="90"
                            value={filters.latitudeRange.max}
                            onChange={(e) => setFilters({
                              ...filters,
                              latitudeRange: { ...filters.latitudeRange, max: e.target.value }
                            })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('filtersSearch.export.minLongitude')}</Label>
                          <Input
                            type="number"
                            placeholder="-180"
                            min="-180"
                            max="180"
                            value={filters.longitudeRange.min}
                            onChange={(e) => setFilters({
                              ...filters,
                              longitudeRange: { ...filters.longitudeRange, min: e.target.value }
                            })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('filtersSearch.export.maxLongitude')}</Label>
                          <Input
                            type="number"
                            placeholder="180"
                            min="-180"
                            max="180"
                            value={filters.longitudeRange.max}
                            onChange={(e) => setFilters({
                              ...filters,
                              longitudeRange: { ...filters.longitudeRange, max: e.target.value }
                            })}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Depth & Pressure Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      {t('filtersSearch.export.depthPressureFilters')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Depth Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t('filtersSearch.export.minDepth')}</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="6000"
                          value={filters.depthRange.min}
                          onChange={(e) => setFilters({
                            ...filters,
                            depthRange: { ...filters.depthRange, min: e.target.value }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t('filtersSearch.export.maxDepth')}</Label>
                        <Input
                          type="number"
                          placeholder="6000"
                          min="0"
                          max="6000"
                          value={filters.depthRange.max}
                          onChange={(e) => setFilters({
                            ...filters,
                            depthRange: { ...filters.depthRange, max: e.target.value }
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>

                    {/* Pressure Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t('filtersSearch.export.minPressure')}</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="6000"
                          value={filters.pressureRange.min}
                          onChange={(e) => setFilters({
                            ...filters,
                            pressureRange: { ...filters.pressureRange, min: e.target.value }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t('filtersSearch.export.maxPressure')}</Label>
                        <Input
                          type="number"
                          placeholder="6000"
                          min="0"
                          max="6000"
                          value={filters.pressureRange.max}
                          onChange={(e) => setFilters({
                            ...filters,
                            pressureRange: { ...filters.pressureRange, max: e.target.value }
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {t('filtersSearch.export.leaveEmptyForNoFilter')}
                    </div>
                  </CardContent>
                </Card>

                {/* Float Filters */}
                <Card>
                  <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('exportOptions.floatSelection')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Float IDs (comma-separated)</Label>
                      <Input
                        placeholder="e.g., 6901234,6901235,6901236"
                        value={filters.floatIds}
                        onChange={(e) => setFilters({...filters, floatIds: e.target.value})}
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">WMO Numbers (comma-separated)</Label>
                      <Input
                        placeholder="e.g., 4901234,4901235"
                        value={filters.wmoIds}
                        onChange={(e) => setFilters({...filters, wmoIds: e.target.value})}
                        className="h-8"
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {t('exportOptions.selectSpecificFloats')}
                    </div>
                  </CardContent>
                </Card>

                {/* Quality & Data Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Quality & Data Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quality Threshold */}
                    <div className="space-y-2">
                      <Label className="text-xs">{t('exportOptions.qualityThreshold')}</Label>
                      <Select value={filters.qcThreshold} onValueChange={(value) => setFilters({...filters, qcThreshold: value})}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Data (no filtering)</SelectItem>
                          <SelectItem value="good">Good Quality Only</SelectItem>
                          <SelectItem value="fair">Good & Fair Quality</SelectItem>
                          <SelectItem value="excellent">Excellent Quality Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Include QC */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs">{t('exportOptions.includeQualityFlags')}</Label>
                        <p className="text-xs text-muted-foreground">{t('exportOptions.addQcColumns')}</p>
                      </div>
                      <Checkbox
                        checked={filters.includeQC}
                        onCheckedChange={(checked: boolean) => setFilters({...filters, includeQC: checked})}
                      />
                    </div>

                    {/* Include Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs">{t('exportOptions.includeMetadata')}</Label>
                        <p className="text-xs text-muted-foreground">{t('exportOptions.addMetadataColumns')}</p>
                      </div>
                      <Checkbox
                        checked={filters.includeMetadata}
                        onCheckedChange={(checked: boolean) => setFilters({...filters, includeMetadata: checked})}
                      />
                    </div>

                    {/* Quality Index */}
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <div className="flex items-center gap-1 text-green-700 font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Current QC: 94.2% Good Quality
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t('exportOptions.exportFormat')}</Label>
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
              <Label className="text-base font-semibold">{t('exportOptions.selectDataTypes')}</Label>
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
                    <span className="text-sm font-medium">{t('exportOptions.preparingExport')}</span>
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
                  {t('exportOptions.exportButton')
                    .replace('{count}', selectedData.length.toString())
                    .replace('{plural}', selectedData.length !== 1 ? 'கள்' : '')
                    .replace('{format}', selectedFormat.toUpperCase())}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('exportOptions.recentExports')}</CardTitle>
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
          <CardTitle className="text-lg">{t('exportOptions.exportGuidelines')}</CardTitle>
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
