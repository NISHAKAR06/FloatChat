import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { PlayCircle, PauseCircle, Settings2 } from 'lucide-react';

// Fix Leaflet marker icon issues
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapPanel = ({ floatData, onMarkerClick, className }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [timeValue, setTimeValue] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);

    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Update markers when float data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !floatData) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    // Add new markers
    floatData.forEach((float) => {
      const marker = L.marker([float.latitude, float.longitude], {
        title: `Float ${float.id}`
      }).addTo(mapInstanceRef.current);

      marker.on('click', () => onMarkerClick(float));
    });
  }, [floatData, onMarkerClick]);

  // Time slider animation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeValue((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <Card className={className}>
      <CardHeader className="bg-ocean-dark text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Float Positions</CardTitle>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapRef} className="h-[400px] w-full z-10" />
          
          {/* Time Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-ocean-dark/90 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-primary hover:text-primary-hover"
              >
                {isPlaying ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
              <Slider
                value={[timeValue]}
                onValueChange={([value]) => setTimeValue(value)}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapPanel;