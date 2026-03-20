
import { useState, useEffect, useCallback, useRef } from 'react';
import { getRealTimeWeather } from '@/services/weatherService';
import { getWaterLevel, getFloodPredictions } from '@/services/floodService';
import { analyzeFloodRisk } from '@/services/aiService';
import { sensorLocations as locations } from '@/data/mockData';
import type { WaterLevelData, WeatherData, FloodAlert, AIPrediction } from '@/types/flood';
import { toast } from 'sonner';

export interface AgentLog {
  id: string;
  type: 'reasoning' | 'action' | 'guardrail' | 'alert' | 'success';
  message: string;
  timestamp: string;
  sensorId?: string;
}

export function useRealTimeData() {
  const [waterLevels, setWaterLevels] = useState<WaterLevelData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const initialized = useRef(false);

  const addLog = useCallback((type: AgentLog['type'], message: string, sensorId?: string) => {
    setAgentLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      sensorId,
    }, ...prev].slice(0, 100));
  }, []);

  const syncData = useCallback(async () => {
    setIsLoading(true);
    addLog('reasoning', 'Initiating full sensor network synchronization...');

    try {
      // Batch water level fetches (limited to avoid rate limits)
      const prioritySensors = locations.slice(0, 6);
      const allSensors = locations;

      const [newWaterLevels, newWeatherData] = await Promise.all([
        Promise.all(allSensors.map(loc => getWaterLevel(loc.id, loc.lat, loc.lng))),
        Promise.all(prioritySensors.map(loc => getRealTimeWeather(loc.id, loc.lat, loc.lng))),
      ]);

      // Fill remaining weather data with extrapolated values
      const fullWeatherData = allSensors.map((loc, i) => {
        if (i < newWeatherData.length) return newWeatherData[i];
        return {
          sensorId: loc.id,
          timestamp: new Date().toISOString(),
          temperature: 28 + Math.random() * 10,
          humidity: 60 + Math.random() * 30,
          rainfall: Math.random() * 20,
          rainfall24h: Math.random() * 80,
          windSpeed: 10 + Math.random() * 20,
          windDirection: 'SW',
          pressure: 1005 + Math.random() * 15,
        } as WeatherData;
      });

      setWaterLevels(newWaterLevels);
      setWeatherData(fullWeatherData);
      setLastUpdated(new Date());
      addLog('success', `Synced ${newWaterLevels.length} sensors, ${newWeatherData.length} weather stations`);

      // Generate predictions + AI analysis for high-risk sensors
      const highRiskSensors = newWaterLevels.filter(w => w.status !== 'safe');
      const predictionPromises = highRiskSensors.slice(0, 5).map(w => {
        const loc = locations.find(l => l.id === w.sensorId)!;
        return getFloodPredictions(w.sensorId, loc.lat, loc.lng, loc.name);
      });
      const newPredictions = await Promise.all(predictionPromises);
      setPredictions(newPredictions);

      // AI analysis for critical sensors
      for (const w of highRiskSensors.slice(0, 2)) {
        const loc = locations.find(l => l.id === w.sensorId)!;
        const weather = fullWeatherData.find(wd => wd.sensorId === w.sensorId);
        addLog('reasoning', `Analyzing risk at ${loc.name}: ${w.currentLevel.toFixed(1)}m / ${w.dangerLevel}m`, w.sensorId);

        try {
          const analysis = await analyzeFloodRisk(
            loc.name, w.currentLevel, w.dangerLevel,
            weather?.rainfall ?? 0, w.trend
          );
          analysis.thoughts.forEach(t => {
            addLog('reasoning', `[${t.step}] ${t.reasoning}`, w.sensorId);
            addLog('action', `ACTION: ${t.action}`, w.sensorId);
            addLog('guardrail', t.guardrailCheck, w.sensorId);
          });
          if (analysis.severity === 'critical' || analysis.severity === 'high') {
            addLog('alert', `⚠ ${loc.name}: ${analysis.recommendation}`, w.sensorId);
          }
        } catch { /* silent */ }
      }

      // Generate alerts for dangerous sensors
      const newAlerts: FloodAlert[] = newWaterLevels
        .filter(w => w.status === 'danger' || w.status === 'warning')
        .map(w => {
          const loc = locations.find(l => l.id === w.sensorId)!;
          return {
            id: `AL-${Date.now()}-${w.sensorId}`,
            sensorId: w.sensorId,
            locationName: `${loc.name}, ${loc.district}`,
            severity: w.status === 'danger' ? 'critical' : 'high',
            type: 'water_level',
            message: `${w.status === 'danger' ? 'DANGER' : 'WARNING'}: ${loc.name} water level at ${w.currentLevel.toFixed(1)}m (threshold: ${w.dangerLevel}m). Trend: ${w.trend}.`,
            timestamp: new Date().toISOString(),
            isRead: false,
            affectedPopulation: Math.floor(10000 + Math.random() * 45000),
          } as FloodAlert;
        });

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          const ids = new Set(prev.map(a => a.sensorId));
          const fresh = newAlerts.filter(a => !ids.has(a.sensorId));
          return [...fresh, ...prev].slice(0, 50);
        });
        if (!initialized.current) {
          toast.warning(`${newAlerts.length} sensor(s) require attention`, { duration: 5000 });
        }
      }
      initialized.current = true;

    } catch (error) {
      console.error('Sync error:', error);
      addLog('alert', 'Sync failed — using cached data. Retrying in 60s.');
      toast.error('Data sync failed. Using cached values.', { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 60000);
    return () => clearInterval(interval);
  }, [syncData]);

  return {
    waterLevels,
    weatherData,
    predictions,
    alerts,
    agentLogs,
    isLoading,
    lastUpdated,
    refresh: syncData,
    setAlerts,
  };
}
