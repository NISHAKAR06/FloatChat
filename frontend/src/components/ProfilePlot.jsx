import React from 'react';
import Plotly from 'plotly.js-dist-min';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Maximize2, Settings2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ProfilePlot = ({ data, title, className }) => {
  const plotRef = React.useRef(null);

  React.useEffect(() => {
    if (!plotRef.current || !data) return;

    // Transform data for depth vs parameter plot
    const traces = Object.keys(data).map(parameter => ({
      x: data[parameter],
      y: data.depth,
      name: parameter,
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        width: 2
      },
      marker: {
        size: 6
      }
    }));

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    const layout = {
      margin: { t: 10, r: 10, l: 60, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      },
      xaxis: {
        title: 'Parameter Value',
        gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        title: 'Depth (m)',
        autorange: 'reversed', // Depth increases downward
        gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      showlegend: true,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      }
    };

    const plotlyDiv = plotRef.current;
    Plotly.newPlot(plotlyDiv, traces, layout, config);

    // Cleanup
    return () => {
      if (plotlyDiv && plotlyDiv._fullLayout) {
        Plotly.purge(plotlyDiv);
      }
    };
  }, [data]);

  const handleExport = (format) => {
    if (!plotRef.current) return;
    
    if (format === 'png') {
      Plotly.downloadImage(plotRef.current, {
        format: 'png',
        width: 1200,
        height: 800,
        filename: `profile_${title.toLowerCase().replace(/\s+/g, '_')}`
      });
    } else {
      // Handle CSV export
      const csvRows = ['depth,' + Object.keys(data).join(',')];
      data.depth.forEach((depth, i) => {
        const row = [depth];
        Object.keys(data).forEach(param => {
          if (param !== 'depth') {
            row.push(data[param][i]);
          }
        });
        csvRows.push(row.join(','));
      });
      
      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `profile_${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
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
            <Select defaultValue="temperature">
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Parameter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="salinity">Salinity</SelectItem>
                <SelectItem value="oxygen">Oxygen</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
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
      <CardContent className="p-4">
        <div ref={plotRef} className="w-full h-[500px]" />
      </CardContent>
    </Card>
  );
};

export default ProfilePlot;