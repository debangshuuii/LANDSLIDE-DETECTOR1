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

interface CacheShape { at: number; data: Record<string, LiveWeather> }

// Read saved weather from browser so we don't fetch every refresh.
export function loadCachedWeather(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheShape>;
    if (typeof parsed.at !== 'number' || !parsed.data || typeof parsed.data !== 'object') return null;
    if (Date.now() - parsed.at > CACHE_MS) return null; // too old
    return parsed as CacheShape;
  } catch { return null; }
}

function saveCache(data: Record<string, LiveWeather>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); }
  catch { /* private mode / quota full: keep data in memory only */ }
}

function currentHourIndex(times: string[]): number {
  // times are "YYYY-MM-DDTHH:00" local ISO; find latest entry <= now
  const now = Date.now();
  let idx = times.length - 1;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    if (Number.isNaN(t)) continue;
    if (t <= now) idx = i; else break;
  }
  return idx;
}

// Fetch ONE zone. Adds up hourly rain ending at the current hour.
async function fetchOneZone(lat: number, lon: number): Promise<Omit<LiveWeather, 'updatedAt'>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&daily=precipitation_sum&timezone=auto&past_days=7&forecast_days=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('weather API failed');
  const j = await res.json();
  const hourly: number[] = j.hourly?.precipitation ?? [];
  const times: string[] = j.hourly?.time ?? [];
  const daily: number[] = j.daily?.precipitation_sum ?? [];
  let rain24: number;
  if (times.length === hourly.length && times.length > 0) {
    const idx = currentHourIndex(times);
    rain24 = hourly.slice(Math.max(0, idx - 23), idx + 1).reduce((s, v) => s + (v || 0), 0);
  } else {
    rain24 = hourly.slice(-24).reduce((s, v) => s + (v || 0), 0);
  }
  // daily[] is oldest→newest, so take the LAST 7 (most recent week)
  const rain7d = daily.slice(-7).reduce((s, v) => s + (v || 0), 0);
  // Simple estimate: more weekly rain = wetter soil. 45 = dry baseline.
  const soilEst = Math.max(20, Math.min(95, Math.round(45 + rain7d / 5)));
  return { rain24mm: Math.round(rain24 * 10) / 10, rain7dmm: Math.round(rain7d * 10) / 10, soilEstPct: soilEst };
}

// Fetch ALL zones in batches of 6 (avoids hammering the free API).
export async function fetchAllLiveWeather(
  zones: { id: string; lat: number; lon: number }[]
): Promise<Record<string, LiveWeather>> {
  const out: Record<string, LiveWeather> = {};
  const now = new Date().toLocaleString();
  for (let i = 0; i < zones.length; i += 6) {
    const batch = zones.slice(i, i + 6);
    await Promise.all(batch.map(async (z) => {
      try {
        const w = await fetchOneZone(z.lat, z.lon);
        out[z.id] = { ...w, updatedAt: now };
      } catch {
        // If one village fails, skip it — App will fall back to demo number.
      }
    }));
  }
  if (Object.keys(out).length > 0) saveCache(out);
  return out;
}
