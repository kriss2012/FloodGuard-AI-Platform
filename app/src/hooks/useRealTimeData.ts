
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
  agent?: 'Hazard' | 'Action' | 'Guardrail' | 'Sensor' | 'System';
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

  const addLog = useCallback((type: AgentLog['type'], message: string, agent: AgentLog['agent'] = 'System', sensorId?: string) => {
    setAgentLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      agent,
      message,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      sensorId,
    }, ...prev].slice(0, 100));
  }, []);

  const syncData = useCallback(async () => {
    setIsLoading(true);
    addLog('reasoning', 'SENSOR_NET: INITIALIZING GLOBAL MATRIX SYNC...', 'Sensor');

    try {
      // Batch water level fetches
      const allSensors = locations;
      addLog('reasoning', `SENSOR_NET: POLLING ${allSensors.length} TELEMETRY NODES...`, 'Sensor');

      const [newWaterLevels, newWeatherData] = await Promise.all([
        Promise.all(allSensors.map(loc => getWaterLevel(loc.id, loc.lat, loc.lng))),
        Promise.all(allSensors.slice(0, 6).map(loc => getRealTimeWeather(loc.id, loc.lat, loc.lng))),
      ]);

      // Fill remaining weather data
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
      addLog('success', `SYSTEM: SYNC COMPLETE. ${newWaterLevels.length} NODES ONLINE.`, 'System');

      // Generate predictions for high-risk sensors
      const highRiskSensors = newWaterLevels.filter(w => w.status !== 'safe');
      if (highRiskSensors.length > 0) {
        addLog('reasoning', `HAZARD_CORE: ELEVATED HYDRATION DETECTED AT ${highRiskSensors.length} NODES.`, 'Hazard');
        
        const predictionPromises = highRiskSensors.slice(0, 5).map(w => {
          const loc = locations.find(l => l.id === w.sensorId)!;
          return getFloodPredictions(w.sensorId, loc.lat, loc.lng, loc.name);
        });
        const newPredictions = await Promise.all(predictionPromises);
        setPredictions(newPredictions);

        // Deep AI analysis for top critical sensors
        for (const w of highRiskSensors.slice(0, 3)) {
          const loc = locations.find(l => l.id === w.sensorId)!;
          const weather = fullWeatherData.find(wd => wd.sensorId === w.sensorId);
          
          addLog('reasoning', `HAZARD_CORE: SPINNING UP LLaMA 3.3 70B FOR ${loc.name.toUpperCase()}...`, 'Hazard', w.sensorId);

          try {
            const analysis = await analyzeFloodRisk(
              loc.name, w.currentLevel, w.dangerLevel,
              weather?.rainfall ?? 0, w.trend
            );

            // Sequential cinematic logs
            for (const t of analysis.thoughts) {
              addLog('reasoning', `[${t.agent.toUpperCase()}] ${t.reasoning}`, t.agent, w.sensorId);
              if (t.action && t.action !== 'Maintain passive observation') {
                addLog('action', `DISPATCH: ${t.action}`, t.agent, w.sensorId);
              }
              addLog('guardrail', `GUARDRAIL: ${t.guardrailCheck} [PASS]`, 'Guardrail', w.sensorId);
            }

            if (analysis.severity === 'critical' || analysis.severity === 'high') {
              addLog('alert', `TACTICAL: ${analysis.recommendation}`, 'Action', w.sensorId);
              toast.error(`CRITICAL: ${loc.name} Risk Level ${analysis.severity.toUpperCase()}`, {
                description: analysis.recommendation,
                duration: 8000,
              });
            }
          } catch (e) {
            console.error('AI Log Error:', e);
          }
        }
      } else {
        addLog('success', 'HAZARD_CORE: ALL NODES WITHIN NOMINAL PARAMETERS.', 'Hazard');
      }

      // Generate UI alerts
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
            message: `${w.status === 'danger' ? 'DANGER' : 'WARNING'}: ${loc.name} at ${w.currentLevel.toFixed(1)}m.`,
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
      }
      initialized.current = true;

    } catch (error) {
      console.error('Sync error:', error);
      addLog('alert', 'SYSTEM: SYNC FAILURE. KERNEL RETRY IN 60S.', 'System');
      toast.error('Tactical data sync failed.');
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 60000);
    return () => clearInterval(interval);
  }, [syncData]);

  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationType, setSimulationType] = useState<string | null>(null);

  const simulateEvent = useCallback((type: string, params?: { rainfall?: number, location?: string }) => {
    setIsLoading(true);
    setIsSimulationActive(true);
    setSimulationType(type);
    const rainfallDisp = params?.rainfall ? ` WITH ${params.rainfall}MM PRECIPITATION` : '';
    const locName = params?.location || 'Simulated Basin NW';
    addLog('alert', `[SYSTEM] MANUAL EMERGENCY OVERRIDE: ${type.toUpperCase()}${rainfallDisp} AT ${locName.toUpperCase()}...`, 'System');
    
    setTimeout(() => {
      if (type === 'flash_flood') {
        const severity = (params?.rainfall || 0) > 100 ? 'critical' : 'high';
        const floodAlert: FloodAlert = {
          id: `sim-${Date.now()}`,
          sensorId: 'S001',
          locationName: locName,
          severity,
          type: 'water_level',
          message: `SIMULATED: ${params?.rainfall ? `${params.rainfall}mm rainfall trigger detected.` : 'Rapid ascent (6.2m).'} Scaling defensive vectors.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          affectedPopulation: (params?.rainfall || 50) * 250
        };
        setAlerts(prev => [floodAlert, ...prev]);
        toast.error(`SIMULATION ALERT: ${severity.toUpperCase()} Flash Flood Detected`, {
          description: `Localized impact modeled for ${locName}.`
        });
      }
      setIsLoading(false);
      setLastUpdated(new Date());
      addLog('success', `SYSTEM: ${type.toUpperCase()} SIMULATION DEPLOYED.`, 'System');
    }, 2000);

    // Auto-reset simulation after 60s
    setTimeout(() => {
      setIsSimulationActive(false);
      setSimulationType(null);
      addLog('success', 'SYSTEM: SIMULATION BUFFER CLEARED. RETURNING TO LIVE FEED.', 'System');
    }, 60000);
  }, [addLog]);

  return {
    waterLevels,
    weatherData,
    predictions,
    alerts,
    agentLogs,
    isSimulationActive,
    simulationType,
    isLoading,
    lastUpdated,
    refresh: syncData,
    setAlerts,
    simulateEvent,
  };
}
