
/**
 * Base API configuration for Open-Meteo
 */
export const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';
export const FLOOD_API_BASE = 'https://flood-api.open-meteo.com/v1';

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}
