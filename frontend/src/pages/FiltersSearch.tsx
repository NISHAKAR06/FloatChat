import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, MapPin, Calendar as CalendarIcon, Thermometer, Droplets, Wind } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const FiltersSearch = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{from: Date; to?: Date} | undefined>();
  const [temperatureRange, setTemperatureRange] = useState([0, 30]);
  const [salinityRange, setSalinityRange] = useState([30, 37]);
  const [depthRange, setDepthRange] = useState([0, 2000]);

  const regions = [
    'North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic',
    'Indian Ocean', 'Arctic Ocean', 'Southern Ocean', 'Mediterranean Sea'
  ];

  const parameters = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'salinity', label: 'Salinity', icon: Droplets },
    { id: 'pressure', label: 'Pressure', icon: Wind },
    { id: 'oxygen', label: 'Dissolved Oxygen', icon: Wind },
    { id: 'ph', label: 'pH Level', icon: Droplets },
    { id: 'chlorophyll', label: 'Chlorophyll', icon: Droplets }
  ];

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
    setActiveFilters([]);
    setSearchQuery('');
    setSelectedRegion('');
    setDateRange(undefined);
    setTemperatureRange([0, 30]);
    setSalinityRange([30, 37]);
    setDepthRange([0, 2000]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-accent bg-clip-text text-transparent">
            Search & Filters
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and filter ARGO float data with advanced search capabilities
          </p>
        </div>
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Query</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search floats, regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <Label>Ocean Regions</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
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

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Temperature Range */}
            <div className="space-y-2">
              <Label>Temperature Range (°C)</Label>
              <div className="px-2">
                <Slider
                  value={temperatureRange}
                  onValueChange={setTemperatureRange}
                  max={40}
                  min={-5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{temperatureRange[0]}°C</span>
                  <span>{temperatureRange[1]}°C</span>
                </div>
              </div>
            </div>

            {/* Salinity Range */}
            <div className="space-y-2">
              <Label>Salinity Range (PSU)</Label>
              <div className="px-2">
                <Slider
                  value={salinityRange}
                  onValueChange={setSalinityRange}
                  max={40}
                  min={25}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{salinityRange[0]} PSU</span>
                  <span>{salinityRange[1]} PSU</span>
                </div>
              </div>
            </div>

            {/* Depth Range */}
            <div className="space-y-2">
              <Label>Depth Range (m)</Label>
              <div className="px-2">
                <Slider
                  value={depthRange}
                  onValueChange={setDepthRange}
                  max={6000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{depthRange[0]}m</span>
                  <span>{depthRange[1]}m</span>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-2">
              <Label>Available Parameters</Label>
              <div className="space-y-2">
                {parameters.map((param) => {
                  const Icon = param.icon;
                  return (
                    <div key={param.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={param.id}
                        checked={activeFilters.includes(param.id)}
                        onCheckedChange={() => toggleFilter(param.id)}
                      />
                      <Label htmlFor={param.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Icon className="h-3 w-3" />
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
              <CardTitle className="text-xl">Search Results</CardTitle>
              <Badge variant="secondary">{filteredResults.length} results found</Badge>
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="outline" className="flex items-center gap-1">
                    {filter}
                    <button
                      onClick={() => toggleFilter(filter)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
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
                          {result.region}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {result.lastUpdate}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">
                          <Thermometer className="h-3 w-3 mr-1" />
                          {result.temperature}°C
                        </Badge>
                        <Badge variant="secondary">
                          <Droplets className="h-3 w-3 mr-1" />
                          {result.salinity} PSU
                        </Badge>
                        <Badge variant="secondary">
                          {result.depth}m depth
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FiltersSearch;
