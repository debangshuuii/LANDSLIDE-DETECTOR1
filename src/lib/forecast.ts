// 72-hour precipitation outlook (Open-Meteo, free, no key).
// Selected-zone only + 1h browser cache — keeps the free API happy.

export interface HourPoint { time: string; mm: number }

const F_KEY = 'bhoomi-forecast72-v1';
const F_MS = 60 * 60 * 1000;

function loadF(key: string): { at: number; hours: HourPoint[] } | null {
  try {
    const raw = localStorage.getItem(`${F_KEY}-${key}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as { at?: number; hours?: HourPoint[] };
    if (typeof p.at !== 'number' || !Array.isArray(p.hours)) return null;
    if (Date.now() - p.at > F_MS) return null;
    return p as { at: number; hours: HourPoint[] };
  } catch { return null; }
}

export async function fetchForecast72h(lat: number, lon: number, cacheId: string): Promise<HourPoint[]> {
  const hit = loadF(cacheId);
  if (hit) return hit.hours;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&timezone=auto&forecast_days=3`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('forecast failed');
  const j = await res.json();
  const times: string[] = j.hourly?.time ?? [];
  const mm: number[] = j.hourly?.precipitation ?? [];
  // Find "now" then take the next 72 hours.
  let start = 0;
  const now = Date.now();
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    if (!Number.isNaN(t) && t <= now) start = i;
    else if (!Number.isNaN(t)) break;
  }
  const hours: HourPoint[] = [];
  for (let i = start; i < Math.min(times.length, start + 72); i += 3) {
    const slice = mm.slice(i, i + 3);
    const sum = slice.reduce((s, v) => s + (v || 0), 0);
    hours.push({ time: times[i]?.slice(5, 16).replace('T', ' ') ?? `+${i - start}h`, mm: Math.round(sum * 10) / 10 });
  }
  try { localStorage.setItem(`${F_KEY}-${cacheId}`, JSON.stringify({ at: Date.now(), hours })); } catch { /* ignore */ }
  return hours;
}

export function forecastTotal(hours: HourPoint[]): number {
  return Math.round(hours.reduce((s, h) => s + h.mm, 0) * 10) / 10;
}
