import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Share2, Settings2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ChartPanel = ({ data, title, type = 'scatter', className }) => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!chartRef.current || !data) return;

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    const layout = {
      margin: { t: 10, r: 10, l: 50, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      },
      xaxis: {
        gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }
    };

    const plotlyDiv = chartRef.current;
    Plotly.newPlot(plotlyDiv, data, layout, config);

    // Cleanup
    return () => {
      if (plotlyDiv && plotlyDiv._fullLayout) {
        Plotly.purge(plotlyDiv);
      }
    };
  }, [data, type]);

  const handleExport = (format) => {
    if (!chartRef.current) return;
    
    if (format === 'png') {
      Plotly.downloadImage(chartRef.current, {
        format: 'png',
        width: 1200,
        height: 800,
        filename: title.toLowerCase().replace(/\s+/g, '_')
      });
    } else {
      // Handle CSV export
      const csvContent = 'data:text/csv;charset=utf-8,' + data.map(d => 
        [d.x, d.y].join(',')
      ).join('\n');
      
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="bg-ocean-dark text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Select defaultValue="scatter">
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scatter">Scatter</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="heatmap">Heatmap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('png')}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('csv')}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
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
      <CardContent className="p-4">
        <div ref={chartRef} className="w-full h-[400px]" />
      </CardContent>
    </Card>
  );
};

export default ChartPanel;
