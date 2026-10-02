// Explainable ML-style risk engine (hackathon prototype).
// Weighted logistic model over terrain + hydro-met features.
// Output: 0-100 score, level, probability, factor breakdown + reasons.
// This is a DEMO decision-support model, not a certified predictor.

import type { NerZone } from '../data/nerDistricts';
import type { Lang } from './i18n';
import { actionText, factorDetail, factorName, reasonText } from './i18n';

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
  id: IDAlert; // rainfall intensity-duration threshold check
}

// Caine (1980) global I-D curve: I = 14.82 * D^-0.39 (mm/h).
// Crossing it means "rainfall alone is historically enough for slides".
export interface IDAlert {
  intensityMmh: number;
  thresholdMmh: number;
  exceeded: boolean;
  note: string;
}

export function idThreshold(rain24mm: number, durationH = 24, lang: Lang = 'en'): IDAlert {
  const intensity = Math.round((rain24mm / durationH) * 100) / 100;
  const threshold = Math.round(14.82 * Math.pow(durationH, -0.39) * 100) / 100;
  const exceeded = intensity >= threshold;
  const v = `${intensity} mm/h ${exceeded ? '≥' : '<'} ${threshold} mm/h over ${durationH}h (Caine curve)`;
  return { intensityMmh: intensity, thresholdMmh: threshold, exceeded, note: reasonText(lang, exceeded ? 'idHit' : 'idOk', v) };
}

const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));
const normRain24 = (mm: number) => clamp((mm / 200) * 100);
const normRain7d = (mm: number) => clamp((mm / 500) * 100);
const normSlope = (d: number) => clamp(((d - 10) / 30) * 100);
const normElev = (m: number) => clamp((m / 3000) * 60 + 10);
const normMoist = (p: number) => clamp(p);
const normHist = (c: number) => clamp((c / 20) * 100);
const normRiver = (m: number) => clamp(100 - (m / 1500) * 100);

export function assessZone(z: NerZone, overrides?: Partial<Pick<NerZone, 'rainfall24mm' | 'rainfall7dmm' | 'soilMoisturePct' | 'slopeDeg'>>, lang: Lang = 'en'): RiskResult {
  const rain24 = overrides?.rainfall24mm ?? z.rainfall24mm;
  const rain7d = overrides?.rainfall7dmm ?? z.rainfall7dmm;
  const moist = overrides?.soilMoisturePct ?? z.soilMoisturePct;
  const slope = overrides?.slopeDeg ?? z.slopeDeg;

  const details = [
    factorDetail(lang, 0, String(rain24)), factorDetail(lang, 1, String(rain7d)),
    factorDetail(lang, 2, String(slope)), factorDetail(lang, 3, String(moist)),
    `${z.elevationM} m, ${z.soil}`, factorDetail(lang, 5, String(z.histCount5y)), factorDetail(lang, 6, String(z.distRiverM)),
  ];
  const factors: RiskFactor[] = [
    { name: factorName(lang, 0), value: normRain24(rain24), weight: 0.26, detail: details[0] },
    { name: factorName(lang, 1), value: normRain7d(rain7d), weight: 0.14, detail: details[1] },
    { name: factorName(lang, 2), value: normSlope(slope), weight: 0.18, detail: details[2] },
    { name: factorName(lang, 3), value: normMoist(moist), weight: 0.16, detail: details[3] },
    { name: factorName(lang, 4), value: normElev(z.elevationM), weight: 0.08, detail: details[4] },
    { name: factorName(lang, 5), value: normHist(z.histCount5y), weight: 0.12, detail: details[5] },
    { name: factorName(lang, 6), value: normRiver(z.distRiverM), weight: 0.06, detail: details[6] },
  ];
  const raw = factors.reduce((s, f) => s + f.value * f.weight, 0);
  // logistic sharpening so mid values separate cleanly
  const score = Math.round(clamp(100 / (1 + Math.exp(-(raw - 52) / 11))));
  const level: RiskLevel = score >= 80 ? 'CRITICAL' : score >= 62 ? 'HIGH' : score >= 40 ? 'MODERATE' : 'LOW';
  const reasons: string[] = [];
  if (rain24 >= 120) reasons.push(reasonText(lang, 'rHeavy', rain24));
  else if (rain24 >= 80) reasons.push(reasonText(lang, 'rElev', rain24));
  if (rain7d >= 350) reasons.push(reasonText(lang, 'rWeek', rain7d));
  if (slope >= 34) reasons.push(reasonText(lang, 'rVSteep', slope));
  else if (slope >= 28) reasons.push(reasonText(lang, 'rSteep', slope));
  if (moist >= 78) reasons.push(reasonText(lang, 'rMoist', moist));
  if (z.histCount5y >= 12) reasons.push(reasonText(lang, 'rHist', z.histCount5y));
  if (z.distRiverM <= 400) reasons.push(reasonText(lang, 'rToe', z.distRiverM));
  if (reasons.length === 0) reasons.push(reasonText(lang, 'rBase', ''));

  const action = actionText(lang, level);

  const color = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MODERATE' ? '#eab308' : '#22c55e';
  const id = idThreshold(rain24, 24, lang);
  if (id.exceeded) reasons.unshift(id.note);
  return { score, level, probabilityPct: score, factors, reasons, action, color, id };
}

export function levelRank(l: RiskLevel) { return l === 'CRITICAL' ? 4 : l === 'HIGH' ? 3 : l === 'MODERATE' ? 2 : 1; }

export const WARNING_META: Record<RiskLevel, { code: string; label: string; color: string }> = {
  LOW: { code: 'GREEN', label: 'Normal', color: '#22c55e' },
  MODERATE: { code: 'YELLOW', label: 'Watch', color: '#eab308' },
  HIGH: { code: 'ORANGE', label: 'High risk', color: '#f97316' },
  CRITICAL: { code: 'RED', label: 'Critical', color: '#ef4444' },
};
