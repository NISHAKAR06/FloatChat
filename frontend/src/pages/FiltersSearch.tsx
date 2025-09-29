import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, MapPin, Calendar as CalendarIcon, Thermometer, Droplets, Wind, Target, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const FiltersSearch = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
  const [activeParameters, setActiveParameters] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{from: Date; to?: Date} | undefined>();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [nearestFloat, setNearestFloat] = useState<any>(null);
  const [temperatureRange, setTemperatureRange] = useState([0, 30]);
  const [salinityRange, setSalinityRange] = useState([30, 37]);
  const [depthRange, setDepthRange] = useState([0, 2000]);

  const regions = [
    'Arabian Sea', 'Bay of Bengal', 'Equator', 'North Pacific', 'South Pacific',
    'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
    'Mediterranean Sea', 'Gulf of Mexico', 'Caribbean Sea', 'Hudson Bay', 'Sea of Japan'
  ];

  const timePeriods = [
    { label: t('filtersSearch.lastMonth'), value: 'last-month' },
    { label: t('filtersSearch.last6Months'), value: 'last-6-months' },
    { label: t('filtersSearch.lastYear'), value: 'last-year' },
    { label: t('filtersSearch.customRange'), value: 'custom' }
  ];

  const parameters = [
    { id: 'temperature', label: t('filtersSearch.temperature'), icon: Thermometer },
    { id: 'salinity', label: t('filtersSearch.salinity'), icon: Droplets },
    { id: 'oxygen', label: t('filtersSearch.oxygen'), icon: Droplets },
    { id: 'nitrate', label: t('filtersSearch.nitrate'), icon: Wind },
    { id: 'phosphate', label: t('filtersSearch.phosphate'), icon: Wind },
    { id: 'ph', label: t('filtersSearch.ph'), icon: Droplets },
    { id: 'chlorophyll', label: t('filtersSearch.chlorophyll'), icon: Droplets },
    { id: 'cdom', label: t('filtersSearch.cdom'), icon: Wind },
    { id: 'backscatter', label: t('filtersSearch.backscatter'), icon: Wind }
  ];

  // Get date range based on selected time period
  const getTimePeriodRange = () => {
    const now = new Date();
    switch (selectedTimePeriod) {
      case 'last-month':
        return { from: subMonths(now, 1), to: now };
      case 'last-6-months':
        return { from: subMonths(now, 6), to: now };
      case 'last-year':
        return { from: subMonths(now, 12), to: now };
      default:
        return dateRange;
    }
  };

  const currentDateRange = getTimePeriodRange();

  // Helper function to get translated region
  const getTranslatedRegion = (region: string) => {
    const regionMap: {[key: string]: string} = {
      'North Pacific': 'northPacific',
      'South Atlantic': 'southAtlantic',
      'Indian Ocean': 'indianOcean',
      'North Atlantic': 'northAtlantic',
      'Mediterranean Sea': 'mediterraneanSea'
    };
    const key = regionMap[region];
    return key ? t(`filtersSearch.regions.${key}`) : region;
  };

  // Helper function to get translated status
  const getTranslatedStatus = (status: string) => {
    return status === 'Active' ? t('filtersSearch.active') : t('filtersSearch.inactive');
  };

  // Extended mock data for more realistic search
  const allFloats = [
    {
      id: 'float-001',
      name: 'ARGO Float #4902345',
      region: 'North Pacific',
      lastUpdate: '2024-01-15',
      temperature: 18.5,
      salinity: 34.2,
      depth: 1200,
      status: 'Active'
    },
    {
      id: 'float-002',
      name: 'ARGO Float #4902346',
      region: 'South Atlantic',
      lastUpdate: '2024-01-14',
      temperature: 22.1,
      salinity: 35.1,
      depth: 800,
      status: 'Active'
    },
    {
      id: 'float-003',
      name: 'ARGO Float #4902347',
      region: 'Indian Ocean',
      lastUpdate: '2024-01-13',
      temperature: 25.3,
      salinity: 34.8,
      depth: 1500,
      status: 'Inactive'
    },
    {
      id: 'float-004',
      name: 'ARGO Float #4902348',
      region: 'North Atlantic',
      lastUpdate: '2024-01-12',
      temperature: 15.8,
      salinity: 35.6,
      depth: 900,
      status: 'Active'
    },
    {
      id: 'float-005',
      name: 'ARGO Float #4902349',
      region: 'Mediterranean Sea',
      lastUpdate: '2024-01-11',
      temperature: 19.2,
      salinity: 38.1,
      depth: 600,
      status: 'Active'
    }
  ];

  // Filter results based on search query and active filters
  const filteredResults = allFloats.filter(float => {
    const matchesSearch = searchQuery === '' ||
      float.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      float.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      float.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = !selectedRegion || float.region === selectedRegion;
    const matchesTempRange = float.temperature >= temperatureRange[0] && float.temperature <= temperatureRange[1];
    const matchesSalinityRange = float.salinity >= salinityRange[0] && float.salinity <= salinityRange[1];
    const matchesDepthRange = float.depth >= depthRange[0] && float.depth <= depthRange[1];

    const matchesParameters = activeFilters.length === 0 ||
      activeFilters.some(filter => {
        if (filter === 'temperature') return true;
        if (filter === 'salinity') return true;
        if (filter === 'pressure') return true;
        // Add more parameter matches as needed
        return false;
      });

    return matchesSearch && matchesRegion && matchesTempRange && matchesSalinityRange && matchesDepthRange && matchesParameters;
  });

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAllFilters = () => {
    setActiveParameters([]);
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedTimePeriod('');
    setDateRange(undefined);
  };

  const findNearestFloat = () => {
    // Mock nearest float finder - in real app this would use coordinates
    const nearest = allFloats[0]; // Just return first one for demo
    setNearestFloat({
      ...nearest,
      distance: '12.5 km',
      coordinates: {
        lat: parseFloat(latitude) || 23.5,
        lng: parseFloat(longitude) || 67.8
      }
    });
  };

  const toggleParameter = (paramId: string) => {
    setActiveParameters(prev =>
      prev.includes(paramId)
        ? prev.filter(p => p !== paramId)
        : [...prev, paramId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            {t('filtersSearch.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('filtersSearch.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={clearAllFilters}>
          {t('filtersSearch.clearAllFilters')}
        </Button>
      </div>

      <Tabs defaultValue="filters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('filtersSearch.regionalFilters')}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('filtersSearch.timePeriod')}
          </TabsTrigger>
          <TabsTrigger value="nearest" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('filtersSearch.nearestFloat')}
          </TabsTrigger>
        </TabsList>

        {/* Regional Filters Tab */}
        <TabsContent value="filters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('filtersSearch.regionalFilters')}
              </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>{t('filtersSearch.searchQuery')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('filtersSearch.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Region Filter */}
                <div className="space-y-2">
                  <Label>{t('filtersSearch.oceanRegions')}</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('filtersSearch.selectRegion')} />
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

                {/* Parameters */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('filtersSearch.availableParameters')}</Label>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {parameters.map((param) => {
                      const Icon = param.icon;
                      return (
                        <div key={param.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50">
                          <Checkbox
                            id={`param-${param.id}`}
                            checked={activeParameters.includes(param.id)}
                            onCheckedChange={() => toggleParameter(param.id)}
                          />
                          <Label htmlFor={`param-${param.id}`} className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                            <Icon className="h-4 w-4" />
                            {param.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t('filtersSearch.searchResults')}</CardTitle>
                  <Badge variant="secondary">{filteredResults.length} {t('filtersSearch.resultsFound')}</Badge>
                </div>
                {activeParameters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeParameters.map((paramId) => {
                      const param = parameters.find(p => p.id === paramId);
                      return param ? (
                        <Badge key={paramId} variant="outline" className="flex items-center gap-1">
                          {param.label}
                          <button
                            onClick={() => toggleParameter(paramId)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{result.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {getTranslatedRegion(result.region)}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {result.lastUpdate}
                            </div>
                            <Badge variant={result.status === 'Active' ? 'default' : 'secondary'}>
                              {getTranslatedStatus(result.status)}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm">{t('filtersSearch.viewDetails')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Period Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('filtersSearch.timePeriodSelection')}
              </CardTitle>
              <CardDescription>
                {t('filtersSearch.chooseTimeRange')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Time Periods */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t('filtersSearch.quickSelect')}</Label>
                  <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timePeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTimePeriod && selectedTimePeriod !== 'custom' && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Selected: {timePeriods.find(p => p.value === selectedTimePeriod)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentDateRange?.from && currentDateRange?.to ?
                          `${format(currentDateRange.from, 'MMM dd, yyyy')} - ${format(currentDateRange.to, 'MMM dd, yyyy')}` :
                          'No date range selected'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Custom Date Range */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t('filtersSearch.customRange')}</Label>
                  <div className="space-y-2">
                    <Label>{t('filtersSearch.startDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ?
                            format(dateRange.from, "MMM dd, yyyy") :
                            <span>{t('filtersSearch.pickStartDate')}</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={dateRange?.from}
                          onSelect={(date) => setDateRange({
                            from: date || undefined,
                            to: dateRange?.to
                          })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('filtersSearch.endDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.to ?
                            format(dateRange.to, "MMM dd, yyyy") :
                            <span>{t('filtersSearch.pickEndDate')}</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={dateRange?.to}
                          onSelect={(date) => setDateRange({
                            from: dateRange?.from,
                            to: date || undefined
                          })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {(currentDateRange?.from || selectedTimePeriod) && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-medium text-primary mb-2">{t('filtersSearch.currentSelection')}</h3>
                  <p className="text-sm">
                    Date Range: {
                      selectedTimePeriod && selectedTimePeriod !== 'custom' ?
                        timePeriods.find(p => p.value === selectedTimePeriod)?.label :
                        (dateRange?.from && dateRange?.to) ?
                          `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` :
                          'Please select a date range'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nearest Float Tab */}
        <TabsContent value="nearest" className="space-y-6">
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('filtersSearch.nearestFloatLocator')}
              </CardTitle>
              <CardDescription>
                {t('filtersSearch.enterCoordinates')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">{t('filtersSearch.latitude')}</Label>
                  <Input
                    id="latitude"
                    type="number"
                    placeholder="-90 to 90"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    min="-90"
                    max="90"
                    step="0.0001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">{t('filtersSearch.longitude')}</Label>
                  <Input
                    id="longitude"
                    type="number"
                    placeholder="-180 to 180"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    min="-180"
                    max="180"
                    step="0.0001"
                  />
                </div>
                <div className="flex items-end">
                    <Button onClick={findNearestFloat} className="w-full" disabled={!latitude || !longitude}>
                    <Search className="h-4 w-4 mr-2" />
                    {t('filtersSearch.findNearest')}
                  </Button>
                </div>
              </div>

              {nearestFloat && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('filtersSearch.nearestFloatResult')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{nearestFloat.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Distance: {nearestFloat.distance}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Coordinates: {nearestFloat.coordinates.lat.toFixed(1)}°, {nearestFloat.coordinates.lng.toFixed(1)}°
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={nearestFloat.status === 'Active' ? 'default' : 'secondary'}>
                              {getTranslatedStatus(nearestFloat.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Region: {getTranslatedRegion(nearestFloat.region)}
                            </span>
                          </div>
                        </div>
                        <Button>{t('filtersSearch.viewOnMap')}</Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Last update: {nearestFloat.lastUpdate}</p>
                        <p>{t('filtersSearch.mockResult')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                  <h4 className="font-medium">{t('filtersSearch.howItWorks')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('filtersSearch.enterCoordinates')}</li>
                  <li>{t('filtersSearch.searchDatabase')}</li>
                  <li>{t('filtersSearch.calculateDistance')}</li>
                  <li>{t('filtersSearch.includeResults')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FiltersSearch;
