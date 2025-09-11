// Mock data for FloatChat application

export const mockOceanData = {
  datasets: [
    {
      id: 1,
      name: "Gulf Stream Temperature Profile",
      location: "North Atlantic",
      coordinates: { lat: 40.7, lng: -70.2 },
      parameters: ["temperature", "salinity", "depth"],
      lastUpdated: "2024-01-15T10:30:00Z",
      dataPoints: 15420,
      source: "NOAA Buoy Network",
      quality: "high"
    },
    {
      id: 2,
      name: "Pacific Current Analysis",
      location: "North Pacific",
      coordinates: { lat: 36.8, lng: -121.9 },
      parameters: ["current_velocity", "direction", "temperature"],
      lastUpdated: "2024-01-15T08:15:00Z",
      dataPoints: 8930,
      source: "Satellite Altimetry",
      quality: "medium"
    },
    {
      id: 3,
      name: "Arctic Sea Ice Monitoring",
      location: "Arctic Ocean",
      coordinates: { lat: 75.2, lng: -120.5 },
      parameters: ["ice_thickness", "temperature", "salinity"],
      lastUpdated: "2024-01-15T12:00:00Z",
      dataPoints: 22100,
      source: "Autonomous Underwater Vehicle",
      quality: "high"
    }
  ],

  alerts: [
    {
      id: 1,
      type: "Temperature Anomaly",
      location: "Gulf Stream - 40.7°N, 70.2°W",
      severity: "high",
      timestamp: "2024-01-15T08:30:00Z",
      description: "Temperature spike detected: 3.2°C above normal",
      threshold: 18.5,
      currentValue: 21.7,
      status: "active"
    },
    {
      id: 2,
      type: "Current Shift",
      location: "California Current - 36.8°N, 121.9°W",
      severity: "medium",
      timestamp: "2024-01-15T04:15:00Z",
      description: "Unusual current velocity changes observed",
      threshold: 0.8,
      currentValue: 1.2,
      status: "active"
    },
    {
      id: 3,
      type: "Salinity Change",
      location: "Labrador Sea - 58.5°N, 52.1°W",
      severity: "low",
      timestamp: "2024-01-14T16:20:00Z",
      description: "Salinity levels 0.5 PSU below seasonal average",
      threshold: 34.5,
      currentValue: 34.0,
      status: "resolved"
    }
  ],

  systemMetrics: {
    totalDatasets: 127,
    activeSensors: 2340,
    dataIngestionRate: "1.2 TB/day",
    systemUptime: "99.8%",
    apiCalls: 156789,
    activeUsers: 1205,
    storageUsed: "45.2 TB",
    processingQueue: 23
  },

  users: [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@oceanic.edu",
      role: "user",
      institution: "Oceanic Research Institute",
      lastLogin: "2024-01-15T09:30:00Z",
      status: "active",
      datasetsAccessed: 45
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      email: "m.chen@marine.org",
      role: "user",
      institution: "Marine Biology Center",
      lastLogin: "2024-01-15T07:15:00Z",
      status: "active",
      datasetsAccessed: 78
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@floatchat.com",
      role: "admin",
      institution: "FloatChat Systems",
      lastLogin: "2024-01-15T10:45:00Z",
      status: "active",
      datasetsAccessed: 156
    }
  ],

  temperatureData: [
    { depth: 0, temperature: 22.4, salinity: 35.2, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 10, temperature: 21.8, salinity: 35.3, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 25, temperature: 20.1, salinity: 35.5, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 50, temperature: 18.7, salinity: 35.8, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 100, temperature: 15.2, salinity: 36.1, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 200, temperature: 12.8, salinity: 36.4, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 500, temperature: 8.3, salinity: 36.8, timestamp: "2024-01-15T10:00:00Z" },
    { depth: 1000, temperature: 4.1, salinity: 37.0, timestamp: "2024-01-15T10:00:00Z" }
  ],

  oceanConditions: {
    waveHeight: 2.4,
    windSpeed: 15,
    visibility: 8.2,
    currentSpeed: 0.8,
    surfaceTemperature: 22.4,
    airTemperature: 18.7,
    humidity: 72,
    pressure: 1013.2
  },

  chatSuggestions: [
    "Show me temperature data for the Gulf Stream",
    "Create a chart of salinity changes over time",
    "Find temperature anomalies in the Atlantic",
    "Export current velocity data as CSV",
    "Compare temperature profiles between regions",
    "Set up an alert for temperature changes",
    "Show me the latest satellite imagery",
    "Generate a report on ocean currents"
  ]
};

// Export individual data sets for easier imports
export const { 
  datasets, 
  alerts, 
  systemMetrics, 
  users, 
  temperatureData, 
  oceanConditions, 
  chatSuggestions 
} = mockOceanData;