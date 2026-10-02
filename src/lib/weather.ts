// Step 1: LIVE weather for beginners.
// Open-Meteo = free weather API, no key needed.
// We ask: "how much rain in last 24h and 7 days?" for each NER zone.
// Soil moisture is ESTIMATED from rain (not a sensor) — we label it clearly.

export interface LiveWeather {
  rain24mm: number;   // mm in last 24 hours
  rain7dmm: number;   // mm in last 7 days
  soilEstPct: number; // estimated 0-100 (from rain, NOT a real sensor)
  updatedAt: string;  // when we fetched
}

const CACHE_KEY = 'landslideguard-live-weather-v1';
const CACHE_MS = 60 * 60 * 1000; // 1 hour — don't spam the API

// Read saved weather from browser so we don't fetch every refresh.
export function loadCachedWeather(): { at: number; data: Record<string, LiveWeather> } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.at > CACHE_MS) return null; // too old
    return parsed;
  } catch { return null; }
}

function saveCache(data: Record<string, LiveWeather>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
}

// Fetch ONE zone. Adds up hourly rain.
async function fetchOneZone(lat: number, lon: number): Promise<Omit<LiveWeather, 'updatedAt'>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&daily=precipitation_sum&timezone=auto&past_days=7&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather API failed');
  const j = await res.json();
  const hourly: number[] = j.hourly?.precipitation ?? [];
  const daily: number[] = j.daily?.precipitation_sum ?? [];
  // last 24 hourly values = last 24h rain
  const rain24 = hourly.slice(-24).reduce((s, v) => s + (v || 0), 0);
  // daily sums (last 7) = 7-day rain
  const rain7d = daily.slice(0, 7).reduce((s, v) => s + (v || 0), 0);
  // Simple estimate: more weekly rain = wetter soil. 45 = dry baseline.
  const soilEst = Math.max(20, Math.min(95, Math.round(45 + rain7d / 5)));
  return { rain24mm: Math.round(rain24 * 10) / 10, rain7dmm: Math.round(rain7d * 10) / 10, soilEstPct: soilEst };
}

// Fetch ALL zones in parallel. ids[i] matches zones[i].
export async function fetchAllLiveWeather(
  zones: { id: string; lat: number; lon: number }[]
): Promise<Record<string, LiveWeather>> {
  const out: Record<string, LiveWeather> = {};
  const now = new Date().toLocaleString();
  // Promise.all = ask all 18 villages at once (fast), not one-by-one (slow)
  await Promise.all(zones.map(async (z) => {
    try {
      const w = await fetchOneZone(z.lat, z.lon);
      out[z.id] = { ...w, updatedAt: now };
    } catch {
      // If one village fails, skip it — App will fall back to demo number.
    }
  }));
  if (Object.keys(out).length > 0) saveCache(out);
  return out;
}
