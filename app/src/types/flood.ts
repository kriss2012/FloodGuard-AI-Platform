export interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  river: string;
  district: string;
  state: string;
}

export interface WaterLevelData {
  sensorId: string;
  timestamp: string;
  currentLevel: number;
  dangerLevel: number;
  warningLevel: number;
  normalLevel: number;
  trend: 'rising' | 'falling' | 'stable';
  status: 'safe' | 'warning' | 'danger';
}

export interface WeatherData {
  sensorId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  rainfall24h: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
}

export interface FloodAlert {
  id: string;
  sensorId: string;
  locationName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'water_level' | 'heavy_rain' | 'flood_prediction' | 'evacuation';
  message: string;
  timestamp: string;
  isRead: boolean;
  affectedPopulation?: number;
}

export interface AIPrediction {
  sensorId: string;
  locationName: string;
  predictionTime: string;
  predictedLevel: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeToFlood?: number;
  recommendation: string;
}

export interface HistoricalEvent {
  id: string;
  date: string;
  location: string;
  sensorId: string;
  maxWaterLevel: number;
  rainfall: number;
  duration: number;
  affectedArea: number;
  casualties: number;
  evacuationCount: number;
  damageEstimate: number;
}

export interface DashboardStats {
  totalSensors: number;
  activeAlerts: number;
  sensorsInWarning: number;
  sensorsInDanger: number;
  avgRainfall24h: number;
  predictedFloods: number;
}

export interface TimeSeriesData {
  timestamp: string;
  waterLevel: number;
  rainfall: number;
  temperature: number;
}
