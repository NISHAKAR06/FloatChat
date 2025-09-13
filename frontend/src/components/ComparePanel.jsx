import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Settings2, Maximize2, Download } from 'lucide-react';
import ChartPanel from './ChartPanel';

const ComparePanel = ({ 
  data, 
  parameters = [], 
  title,
  onParameterChange,
  onTimeRangeChange,
  className 
}) => {
  const [selectedParams, setSelectedParams] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('overlay');
  const [timeRange, setTimeRange] = React.useState('24h');

  const handleParameterChange = (param) => {
    let newParams;
    if (selectedParams.includes(param)) {
      newParams = selectedParams.filter(p => p !== param);
    } else if (selectedParams.length < 3) {
      newParams = [...selectedParams, param];
    } else {
      return; // Max 3 parameters
    }
    setSelectedParams(newParams);
    onParameterChange?.(newParams);
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    onTimeRangeChange?.(value);
  };

  return (
    <Card className={className}>
      <CardHeader className="bg-ocean-dark text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="text-white hover:bg-white/20"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {parameters.map(param => (
            <Button
              key={param.id}
              variant={selectedParams.includes(param.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleParameterChange(param.id)}
              className={
                selectedParams.includes(param.id) 
                  ? "bg-primary hover:bg-primary-hover" 
                  : ""
              }
            >
              {param.label}
            </Button>
          ))}
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="sideBySide">Side by Side</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>

          <TabsContent value="overlay" className="space-y-4">
            <ChartPanel
              data={data.map((d, i) => ({
                ...d,
                name: parameters.find(p => p.id === selectedParams[i])?.label
              }))}
              title="Combined View"
            />
          </TabsContent>

          <TabsContent value="sideBySide" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedParams.map((paramId, index) => (
              <ChartPanel
                key={paramId}
                data={[data[index]]}
                title={parameters.find(p => p.id === paramId)?.label}
              />
            ))}
          </TabsContent>

          <TabsContent value="grid" className="grid grid-cols-2 gap-4">
            {selectedParams.map((paramId, index) => (
              <ChartPanel
                key={paramId}
                data={[data[index]]}
                title={parameters.find(p => p.id === paramId)?.label}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComparePanel;