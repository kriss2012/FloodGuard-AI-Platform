
import { FLOOD_API_BASE, fetchJson } from './api';
import type { WaterLevelData, AIPrediction } from '@/types/flood';

interface OpenMeteoFloodResponse {
  daily: {
    time: string[];
    river_discharge: number[];
  };
}

export async function getWaterLevel(sensorId: string, lat: number, lng: number): Promise<WaterLevelData> {
  const url = `${FLOOD_API_BASE}/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge&forecast_days=1`;
  
  const data = await fetchJson<OpenMeteoFloodResponse>(url);
  const discharge = data.daily.river_discharge[0] || 0;
  
  // Mapping river discharge (m3/s) to water level (m) for simulation
  const currentLevel = (discharge / 100) + 10; 
  const dangerLevel = 80;
  const warningLevel = 70;
  const normalLevel = 50;

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (currentLevel >= dangerLevel) status = 'danger';
  else if (currentLevel >= warningLevel) status = 'warning';

  return {
    sensorId,
    timestamp: new Date().toISOString(),
    currentLevel,
    dangerLevel,
    warningLevel,
    normalLevel,
    trend: Math.random() > 0.5 ? 'rising' : 'falling',
    status
  };
}

export async function getFloodPredictions(sensorId: string, lat: number, lng: number, locationName: string): Promise<AIPrediction> {
  const url = `${FLOOD_API_BASE}/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge&forecast_days=7`;
  
  const data = await fetchJson<OpenMeteoFloodResponse>(url);
  const maxDischarge = Math.max(...data.daily.river_discharge);
  const predictedLevel = (maxDischarge / 100) + 10;
  
  const confidence = 85 + Math.random() * 10;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let recommendation = 'No immediate action required.';

  if (predictedLevel > 80) {
    riskLevel = 'critical';
    recommendation = 'Critical flood risk detected. Initiate emergency response protocols.';
  } else if (predictedLevel > 70) {
    riskLevel = 'high';
    recommendation = 'High flood risk. Pre-deploy emergency personnel and alert residents.';
  } else if (predictedLevel > 60) {
    riskLevel = 'medium';
    recommendation = 'Moderate risk. Monitor water levels closely every 15 minutes.';
  }

  return {
    sensorId,
    locationName,
    predictionTime: data.daily.time[1],
    predictedLevel,
    confidence,
    riskLevel,
    timeToFlood: predictedLevel > 70 ? 12 : 24,
    recommendation
  };
}
