// Geo helpers: distance + nearest zone. No new dependency.

export function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

export function nearestZone<T extends { id: string; lat: number; lon: number }>(
  zones: T[], lat: number, lon: number
): { zone: T; km: number } | null {
  let best: T | null = null;
  let bestKm = Infinity;
  for (const z of zones) {
    const km = haversineKm(lat, lon, z.lat, z.lon);
    if (km < bestKm) { bestKm = km; best = z; }
  }
  return best ? { zone: best, km: Math.round(bestKm * 10) / 10 } : null;
}

// Deterministic schematic terrain transect for the elevation profile.
// NOT a surveyed cross-section — clearly labeled in the UI.
export function schematicTransect(elevationM: number, slopeDeg: number, points = 24): { x: number; m: number }[] {
  const out: { x: number; m: number }[] = [];
  const amp = Math.min(400, Math.max(60, elevationM * 0.12 + slopeDeg * 4));
  for (let i = 0; i < points; i++) {
    const phase = (i / (points - 1)) * Math.PI * 2;
    const m = Math.round(elevationM + Math.sin(phase) * amp * 0.5 + Math.sin(phase * 2.3) * amp * 0.18);
    out.push({ x: i + 1, m: Math.max(0, m) });
  }
  return out;
}
