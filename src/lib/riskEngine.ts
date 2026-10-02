// Explainable ML-style risk engine (hackathon prototype).
// Weighted logistic model over terrain + hydro-met features.
// Output: 0-100 score, level, probability, factor breakdown + reasons.
// This is a DEMO decision-support model, not a certified predictor.

import type { NerZone } from '../data/nerDistricts';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  name: string;
  value: number; // 0-100 normalized contribution
  weight: number;
  detail: string;
}

export interface RiskResult {
  score: number; // 0-100
  level: RiskLevel;
  probabilityPct: number;
  factors: RiskFactor[];
  reasons: string[];
  action: string;
  color: string;
}

const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));
const normRain24 = (mm: number) => clamp((mm / 200) * 100);
const normRain7d = (mm: number) => clamp((mm / 500) * 100);
const normSlope = (d: number) => clamp(((d - 10) / 30) * 100);
const normElev = (m: number) => clamp((m / 3000) * 60 + 10);
const normMoist = (p: number) => clamp(p);
const normHist = (c: number) => clamp((c / 20) * 100);
const normRiver = (m: number) => clamp(100 - (m / 1500) * 100);

export function assessZone(z: NerZone, overrides?: Partial<Pick<NerZone, 'rainfall24mm' | 'rainfall7dmm' | 'soilMoisturePct' | 'slopeDeg'>>): RiskResult {
  const rain24 = overrides?.rainfall24mm ?? z.rainfall24mm;
  const rain7d = overrides?.rainfall7dmm ?? z.rainfall7dmm;
  const moist = overrides?.soilMoisturePct ?? z.soilMoisturePct;
  const slope = overrides?.slopeDeg ?? z.slopeDeg;

  const factors: RiskFactor[] = [
    { name: 'Rainfall (24h)', value: normRain24(rain24), weight: 0.26, detail: `${rain24} mm in last 24h` },
    { name: 'Rainfall (7d)', value: normRain7d(rain7d), weight: 0.14, detail: `${rain7d} mm cumulative 7-day` },
    { name: 'Slope', value: normSlope(slope), weight: 0.18, detail: `${slope}° slope angle` },
    { name: 'Soil saturation', value: normMoist(moist), weight: 0.16, detail: `${moist}% soil moisture (simulated)` },
    { name: 'Terrain / Elevation', value: normElev(z.elevationM), weight: 0.08, detail: `${z.elevationM} m, ${z.soil}` },
    { name: 'Historical activity', value: normHist(z.histCount5y), weight: 0.12, detail: `${z.histCount5y} incidents / 5y (demo db)` },
    { name: 'River proximity', value: normRiver(z.distRiverM), weight: 0.06, detail: `${z.distRiverM} m from drainage` },
  ];
  const raw = factors.reduce((s, f) => s + f.value * f.weight, 0);
  // logistic sharpening so mid values separate cleanly
  const score = Math.round(clamp(100 / (1 + Math.exp(-(raw - 52) / 11))));
  const level: RiskLevel = score >= 80 ? 'CRITICAL' : score >= 62 ? 'HIGH' : score >= 40 ? 'MODERATE' : 'LOW';
  const reasons: string[] = [];
  if (rain24 >= 120) reasons.push(`Heavy rainfall in last 24h (${rain24} mm)`);
  else if (rain24 >= 80) reasons.push(`Elevated 24h rainfall (${rain24} mm)`);
  if (rain7d >= 350) reasons.push(`Saturated antecedent week (${rain7d} mm / 7d)`);
  if (slope >= 34) reasons.push(`Very steep slope (${slope}°) prone to failure`);
  else if (slope >= 28) reasons.push(`Steep slope (${slope}°)`);
  if (moist >= 78) reasons.push(`High soil moisture (${moist}%) — low residual strength`);
  if (z.histCount5y >= 12) reasons.push(`Repeat slide history (${z.histCount5y} in 5y)`);
  if (z.distRiverM <= 400) reasons.push(`Toe erosion risk — close to drainage (${z.distRiverM} m)`);
  if (reasons.length === 0) reasons.push('No dominant trigger — baseline terrain susceptibility only');

  const action =
    level === 'CRITICAL' ? 'Restrict movement on exposed roads; notify DDMA control room; prepare evacuation of toe settlements.'
    : level === 'HIGH' ? 'Increase monitoring of vulnerable roads/ridges; issue advisory to field teams.'
    : level === 'MODERATE' ? 'Watch: re-check after next rainfall update.'
    : 'Monitor routinely.';

  const color = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MODERATE' ? '#eab308' : '#22c55e';
  return { score, level, probabilityPct: score, factors, reasons, action, color };
}

export function levelRank(l: RiskLevel) { return l === 'CRITICAL' ? 4 : l === 'HIGH' ? 3 : l === 'MODERATE' ? 2 : 1; }

export const WARNING_META: Record<RiskLevel, { code: string; label: string; color: string }> = {
  LOW: { code: 'GREEN', label: 'Normal', color: '#22c55e' },
  MODERATE: { code: 'YELLOW', label: 'Watch', color: '#eab308' },
  HIGH: { code: 'ORANGE', label: 'High risk', color: '#f97316' },
  CRITICAL: { code: 'RED', label: 'Critical', color: '#ef4444' },
};
