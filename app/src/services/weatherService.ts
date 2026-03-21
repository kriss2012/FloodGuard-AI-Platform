
import { WEATHER_API_BASE, fetchJson } from './api';
import type { WeatherData, TimeSeriesData } from '@/types/flood';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    pressure_msl: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
  };
}

export async function getRealTimeWeather(sensorId: string, lat: number, lng: number): Promise<WeatherData> {
  const url = `${WEATHER_API_BASE}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl&timezone=auto`;
  
  const data = await fetchJson<OpenMeteoResponse>(url);
  
  return {
    sensorId,
    timestamp: new Date().toISOString(),
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    rainfall: data.current.precipitation,
    rainfall24h: data.current.precipitation * 5, // Estimating for demo purposes
    windSpeed: data.current.wind_speed_10m,
    windDirection: 'N', // Simplified
    pressure: data.current.pressure_msl
  };
}

export async function getWeatherHistory(lat: number, lng: number): Promise<TimeSeriesData[]> {
  const url = `${WEATHER_API_BASE}/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation&past_days=1&forecast_days=0`;
  
  const data = await fetchJson<OpenMeteoResponse>(url);
  
  return data.hourly.time.map((time, index) => ({
    timestamp: time,
    waterLevel: 0, // To be filled by flood service
    rainfall: data.hourly.precipitation[index],
    temperature: data.hourly.temperature_2m[index]
  }));
}
