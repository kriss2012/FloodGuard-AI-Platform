import type { 
  SensorLocation, 
  WaterLevelData, 
  WeatherData, 
  FloodAlert, 
  AIPrediction,
  HistoricalEvent,
  DashboardStats,
  TimeSeriesData
} from '@/types/flood';

export const sensorLocations: SensorLocation[] = [
  { id: 'S001', name: 'Ganges Barrage', lat: 25.3176, lng: 82.9739, river: 'Ganges', district: 'Varanasi', state: 'Uttar Pradesh' },
  { id: 'S002', name: 'Yamuna Bridge', lat: 28.6139, lng: 77.2090, river: 'Yamuna', district: 'New Delhi', state: 'Delhi' },
  { id: 'S003', name: 'Brahmaputra Point', lat: 26.2006, lng: 91.7339, river: 'Brahmaputra', district: 'Guwahati', state: 'Assam' },
  { id: 'S004', name: 'Godavari Dam', lat: 16.5062, lng: 80.6480, river: 'Godavari', district: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: 'S005', name: 'Krishna Delta', lat: 15.9129, lng: 79.7400, river: 'Krishna', district: 'Guntur', state: 'Andhra Pradesh' },
  { id: 'S006', name: 'Kaveri Basin', lat: 12.2958, lng: 76.6394, river: 'Kaveri', district: 'Mysuru', state: 'Karnataka' },
  { id: 'S007', name: 'Narmada Check', lat: 22.5726, lng: 73.3616, river: 'Narmada', district: 'Bharuch', state: 'Gujarat' },
  { id: 'S008', name: 'Tapi Monitor', lat: 21.1702, lng: 72.8311, river: 'Tapi', district: 'Surat', state: 'Gujarat' },
  { id: 'S009', name: 'Mahanadi Gauge', lat: 20.2961, lng: 85.8245, river: 'Mahanadi', district: 'Cuttack', state: 'Odisha' },
  { id: 'S010', name: 'Hooghly Station', lat: 22.5726, lng: 88.3639, river: 'Hooghly', district: 'Kolkata', state: 'West Bengal' },
  { id: 'S011', name: 'Cauvery Delta', lat: 10.7905, lng: 78.7047, river: 'Cauvery', district: 'Thanjavur', state: 'Tamil Nadu' },
  { id: 'S012', name: 'Periyar Dam', lat: 9.9312, lng: 76.2673, river: 'Periyar', district: 'Idukki', state: 'Kerala' },
];

export const waterLevelData: WaterLevelData[] = [
  { sensorId: 'S001', timestamp: new Date().toISOString(), currentLevel: 72.5, dangerLevel: 80.0, warningLevel: 70.0, normalLevel: 50.0, trend: 'rising', status: 'warning' },
  { sensorId: 'S002', timestamp: new Date().toISOString(), currentLevel: 204.2, dangerLevel: 207.0, warningLevel: 204.0, normalLevel: 199.0, trend: 'rising', status: 'danger' },
  { sensorId: 'S003', timestamp: new Date().toISOString(), currentLevel: 48.3, dangerLevel: 52.0, warningLevel: 49.0, normalLevel: 45.0, trend: 'stable', status: 'safe' },
  { sensorId: 'S004', timestamp: new Date().toISOString(), currentLevel: 28.7, dangerLevel: 35.0, warningLevel: 30.0, normalLevel: 22.0, trend: 'falling', status: 'safe' },
  { sensorId: 'S005', timestamp: new Date().toISOString(), currentLevel: 15.2, dangerLevel: 18.0, warningLevel: 16.0, normalLevel: 12.0, trend: 'rising', status: 'warning' },
  { sensorId: 'S006', timestamp: new Date().toISOString(), currentLevel: 42.1, dangerLevel: 48.0, warningLevel: 44.0, normalLevel: 38.0, trend: 'stable', status: 'safe' },
  { sensorId: 'S007', timestamp: new Date().toISOString(), currentLevel: 31.5, dangerLevel: 38.0, warningLevel: 34.0, normalLevel: 28.0, trend: 'falling', status: 'safe' },
  { sensorId: 'S008', timestamp: new Date().toISOString(), currentLevel: 12.8, dangerLevel: 15.0, warningLevel: 13.5, normalLevel: 10.0, trend: 'rising', status: 'warning' },
  { sensorId: 'S009', timestamp: new Date().toISOString(), currentLevel: 28.9, dangerLevel: 32.0, warningLevel: 30.0, normalLevel: 25.0, trend: 'rising', status: 'warning' },
  { sensorId: 'S010', timestamp: new Date().toISOString(), currentLevel: 5.2, dangerLevel: 6.5, warningLevel: 5.8, normalLevel: 4.0, trend: 'stable', status: 'safe' },
  { sensorId: 'S011', timestamp: new Date().toISOString(), currentLevel: 8.7, dangerLevel: 12.0, warningLevel: 10.0, normalLevel: 6.0, trend: 'rising', status: 'warning' },
  { sensorId: 'S012', timestamp: new Date().toISOString(), currentLevel: 45.3, dangerLevel: 50.0, warningLevel: 47.0, normalLevel: 40.0, trend: 'rising', status: 'warning' },
];

export const weatherData: WeatherData[] = [
  { sensorId: 'S001', timestamp: new Date().toISOString(), temperature: 32.5, humidity: 78, rainfall: 12.5, rainfall24h: 85.3, windSpeed: 18, windDirection: 'SW', pressure: 1008.2 },
  { sensorId: 'S002', timestamp: new Date().toISOString(), temperature: 35.2, humidity: 72, rainfall: 8.2, rainfall24h: 62.1, windSpeed: 22, windDirection: 'W', pressure: 1005.8 },
  { sensorId: 'S003', timestamp: new Date().toISOString(), temperature: 29.8, humidity: 88, rainfall: 25.3, rainfall24h: 145.7, windSpeed: 15, windDirection: 'SE', pressure: 1002.4 },
  { sensorId: 'S004', timestamp: new Date().toISOString(), temperature: 33.1, humidity: 65, rainfall: 2.1, rainfall24h: 18.5, windSpeed: 12, windDirection: 'E', pressure: 1012.6 },
  { sensorId: 'S005', timestamp: new Date().toISOString(), temperature: 34.5, humidity: 70, rainfall: 5.8, rainfall24h: 42.3, windSpeed: 16, windDirection: 'NE', pressure: 1009.3 },
  { sensorId: 'S006', timestamp: new Date().toISOString(), temperature: 28.9, humidity: 75, rainfall: 3.2, rainfall24h: 28.7, windSpeed: 14, windDirection: 'S', pressure: 1011.5 },
  { sensorId: 'S007', timestamp: new Date().toISOString(), temperature: 36.2, humidity: 58, rainfall: 0.0, rainfall24h: 5.2, windSpeed: 20, windDirection: 'NW', pressure: 1014.2 },
  { sensorId: 'S008', timestamp: new Date().toISOString(), temperature: 31.7, humidity: 82, rainfall: 15.6, rainfall24h: 98.4, windSpeed: 25, windDirection: 'SW', pressure: 1004.7 },
  { sensorId: 'S009', timestamp: new Date().toISOString(), temperature: 30.5, humidity: 85, rainfall: 18.9, rainfall24h: 112.6, windSpeed: 19, windDirection: 'SE', pressure: 1003.1 },
  { sensorId: 'S010', timestamp: new Date().toISOString(), temperature: 33.8, humidity: 80, rainfall: 9.4, rainfall24h: 67.2, windSpeed: 17, windDirection: 'S', pressure: 1007.5 },
  { sensorId: 'S011', timestamp: new Date().toISOString(), temperature: 31.2, humidity: 74, rainfall: 4.5, rainfall24h: 35.8, windSpeed: 13, windDirection: 'E', pressure: 1010.8 },
  { sensorId: 'S012', timestamp: new Date().toISOString(), temperature: 27.6, humidity: 90, rainfall: 32.1, rainfall24h: 178.5, windSpeed: 21, windDirection: 'SW', pressure: 999.8 },
];

export const floodAlerts: FloodAlert[] = [
  { id: 'A001', sensorId: 'S002', locationName: 'Yamuna Bridge, New Delhi', severity: 'critical', type: 'water_level', message: 'Water level has crossed danger mark. Immediate evacuation recommended for low-lying areas.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), isRead: false, affectedPopulation: 25000 },
  { id: 'A002', sensorId: 'S012', locationName: 'Periyar Dam, Idukki', severity: 'high', type: 'heavy_rain', message: 'Heavy rainfall detected. Dam gates may be opened. Stay alert for flash floods.', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), isRead: false, affectedPopulation: 15000 },
  { id: 'A003', sensorId: 'S003', locationName: 'Brahmaputra Point, Guwahati', severity: 'medium', type: 'flood_prediction', message: 'AI predicts 75% chance of flood within next 24 hours. Precautionary measures advised.', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), isRead: true, affectedPopulation: 50000 },
  { id: 'A004', sensorId: 'S008', locationName: 'Tapi Monitor, Surat', severity: 'high', type: 'water_level', message: 'Water level rising rapidly. Warning stage crossed. Prepare for evacuation.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false, affectedPopulation: 35000 },
  { id: 'A005', sensorId: 'S009', locationName: 'Mahanadi Gauge, Cuttack', severity: 'medium', type: 'flood_prediction', message: 'Predicted water level rise due to upstream rainfall. Monitor situation closely.', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), isRead: true, affectedPopulation: 20000 },
  { id: 'A006', sensorId: 'S001', locationName: 'Ganges Barrage, Varanasi', severity: 'low', type: 'water_level', message: 'Water level approaching warning stage. No immediate danger but stay vigilant.', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), isRead: true, affectedPopulation: 10000 },
];

export const aiPredictions: AIPrediction[] = [
  { sensorId: 'S002', locationName: 'Yamuna Bridge, New Delhi', predictionTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), predictedLevel: 208.5, confidence: 92, riskLevel: 'critical', timeToFlood: 6, recommendation: 'Immediate evacuation required. Critical flood expected within 6 hours.' },
  { sensorId: 'S012', locationName: 'Periyar Dam, Idukki', predictionTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), predictedLevel: 51.2, confidence: 87, riskLevel: 'high', timeToFlood: 12, recommendation: 'High risk of dam overflow. Prepare for controlled release and downstream evacuation.' },
  { sensorId: 'S003', locationName: 'Brahmaputra Point, Guwahati', predictionTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), predictedLevel: 53.8, confidence: 75, riskLevel: 'high', timeToFlood: 24, recommendation: 'Flood likely within 24 hours. Move valuables to higher ground.' },
  { sensorId: 'S008', locationName: 'Tapi Monitor, Surat', predictionTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), predictedLevel: 16.2, confidence: 85, riskLevel: 'high', timeToFlood: 8, recommendation: 'Danger level will be crossed. Evacuate low-lying areas immediately.' },
  { sensorId: 'S009', locationName: 'Mahanadi Gauge, Cuttack', predictionTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), predictedLevel: 33.5, confidence: 68, riskLevel: 'medium', timeToFlood: 18, recommendation: 'Moderate flood risk. Stay alert and monitor updates.' },
];

export const historicalEvents: HistoricalEvent[] = [
  { id: 'H001', date: '2024-07-15', location: 'Yamuna Bridge, New Delhi', sensorId: 'S002', maxWaterLevel: 208.6, rainfall: 156.8, duration: 72, affectedArea: 45, casualties: 12, evacuationCount: 35000, damageEstimate: 125000000 },
  { id: 'H002', date: '2024-06-22', location: 'Brahmaputra Point, Guwahati', sensorId: 'S003', maxWaterLevel: 55.2, rainfall: 234.5, duration: 96, affectedArea: 120, casualties: 28, evacuationCount: 85000, damageEstimate: 450000000 },
  { id: 'H003', date: '2024-08-05', location: 'Periyar Dam, Idukki', sensorId: 'S012', maxWaterLevel: 52.8, rainfall: 312.4, duration: 48, affectedArea: 35, casualties: 8, evacuationCount: 22000, damageEstimate: 180000000 },
  { id: 'H004', date: '2024-09-12', location: 'Tapi Monitor, Surat', sensorId: 'S008', maxWaterLevel: 17.5, rainfall: 189.2, duration: 36, affectedArea: 28, casualties: 5, evacuationCount: 18000, damageEstimate: 95000000 },
  { id: 'H005', date: '2024-05-28', location: 'Mahanadi Gauge, Cuttack', sensorId: 'S009', maxWaterLevel: 35.1, rainfall: 145.6, duration: 60, affectedArea: 55, casualties: 15, evacuationCount: 42000, damageEstimate: 210000000 },
  { id: 'H006', date: '2023-08-18', location: 'Ganges Barrage, Varanasi', sensorId: 'S001', maxWaterLevel: 82.3, rainfall: 178.4, duration: 84, affectedArea: 65, casualties: 18, evacuationCount: 48000, damageEstimate: 280000000 },
];

export const dashboardStats: DashboardStats = {
  totalSensors: 12,
  activeAlerts: 6,
  sensorsInWarning: 6,
  sensorsInDanger: 1,
  avgRainfall24h: 78.4,
  predictedFloods: 5,
};

// Generate time series data for charts
export const generateTimeSeriesData = (sensorId: string, hours: number = 24): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  const baseWaterLevel = waterLevelData.find(w => w.sensorId === sensorId)?.currentLevel || 50;
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = Math.sin(i * 0.5) * 5 + Math.random() * 3;
    data.push({
      timestamp: timestamp.toISOString(),
      waterLevel: Math.max(0, baseWaterLevel + variation - i * 0.2),
      rainfall: Math.max(0, Math.random() * 30 + (i < 6 ? 15 : 0)),
      temperature: 28 + Math.random() * 8,
    });
  }
  return data;
};

// Generate forecast data
export const generateForecastData = (sensorId: string, hours: number = 24): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  const baseWaterLevel = waterLevelData.find(w => w.sensorId === sensorId)?.currentLevel || 50;
  
  for (let i = 0; i <= hours; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
    const trend = i * 0.8; // Rising trend
    data.push({
      timestamp: timestamp.toISOString(),
      waterLevel: Math.max(0, baseWaterLevel + trend + Math.random() * 2),
      rainfall: Math.max(0, Math.random() * 20),
      temperature: 28 + Math.random() * 6,
    });
  }
  return data;
};
