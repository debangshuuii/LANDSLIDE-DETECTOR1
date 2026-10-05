// Environmental math: deforestation velocity, watershed, carbon,
// biodiversity, NDVI, climate stress, and the unified EVI.
// All demo-grade estimates — every number is labeled, never measured.

import { ecoOf, envOf } from '../data/eco';
import type { NerZone } from '../data/nerDistricts';

const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));

export type EviLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export function eviLevel(score: number): EviLevel {
  if (score >= 81) return 'CRITICAL';
  if (score >= 61) return 'HIGH';
  if (score >= 41) return 'ELEVATED';
  if (score >= 21) return 'MODERATE';
  return 'LOW';
}

// Annual forest loss → velocity class (demo thresholds, ISFR-style bands).
export function deforVelocity(lossPct: number): { label: string; color: string } {
  if (lossPct >= 2.5) return { label: 'Critical', color: '#ef4444' };
  if (lossPct >= 1.8) return { label: 'High', color: '#f97316' };
  if (lossPct >= 1.0) return { label: 'Moderate', color: '#eab308' };
  if (lossPct >= 0.5) return { label: 'Low', color: '#84cc16' };
  return { label: 'Stable', color: '#22c55e' };
}

export function ndviClass(v: number): string {
  if (v > 0.7) return 'Healthy';
  if (v >= 0.5) return 'Moderate';
  if (v >= 0.3) return 'Stressed';
  return 'Severely stressed';
}

// Conceptual sediment model: spoil near a river + blocked gullies = HIGH.
export function watershedOf(zone: NerZone): { sediment: string; sensitivity: string; downstream: string; score: number } {
  const eco = ecoOf(zone.id);
  const nearRiver = zone.distRiverM <= 600;
  const sediment = eco.intervention.spoil && nearRiver ? 'HIGH' : nearRiver || eco.intervention.spoil ? 'MODERATE' : 'LOW';
  const sensitivity = zone.distRiverM <= 400 ? 'CRITICAL' : nearRiver ? 'HIGH' : zone.distRiverM <= 1000 ? 'MODERATE' : 'LOW';
  const downstream = zone.populationExposed >= 30000 ? 'HIGH' : zone.populationExposed >= 12000 ? 'MODERATE' : 'LOW';
  const num = (s: string) => (s === 'CRITICAL' ? 95 : s === 'HIGH' ? 75 : s === 'MODERATE' ? 50 : 20);
  return { sediment, sensitivity, downstream, score: Math.round((num(sediment) + num(sensitivity) + num(downstream)) / 3) };
}

// ≈ carbon at risk: canopy × area × 1.8 tCO₂e/ha (demo factor, rounded).
export function carbonAtRisk(zoneId: string): number {
  const eco = ecoOf(zoneId);
  const env = envOf(zoneId);
  return Math.round(((eco.canopyPct / 100) * env.carbonHa * 1.8) / 10) * 10;
}

const LANDUSE_PRESSURE: Record<string, number> = {
  'Dense Forest': 15, 'Degraded Forest': 45, 'Fallow Jhum': 35, 'Active Jhum': 80, Agriculture: 50, Settlement: 65, 'Road Corridor': 85,
};

export interface EviResult {
  score: number;
  level: EviLevel;
  parts: { key: string; value: number }[];
}

// Unified Environmental Vulnerability Index (landslide kept separate).
export function eviFor(zone: NerZone, landslideScore: number): EviResult {
  const eco = ecoOf(zone.id);
  const env = envOf(zone.id);
  const ws = watershedOf(zone);
  const parts = [
    { key: 'landslide', value: landslideScore },
    { key: 'deforestation', value: clamp((env.annualLossPct / 3) * 100) },
    { key: 'vegetation', value: clamp(((0.85 - env.ndvi) / 0.55) * 100) },
    { key: 'watershed', value: ws.score },
    { key: 'biodiversity', value: (env.bioSens / 4) * 100 },
    { key: 'climate', value: clamp(((env.tempAnomC - 0.8) / 0.8) * 100) },
    { key: 'landuse', value: LANDUSE_PRESSURE[env.landUse] ?? 50 },
  ];
  const weights = [0.25, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125];
  const score = Math.round(parts.reduce((s, p, i) => s + p.value * weights[i], 0));
  return { score, level: eviLevel(score), parts };
}

export function bioLabel(n: number): string {
  return n >= 4 ? 'CRITICAL' : n === 3 ? 'HIGH' : n === 2 ? 'MODERATE' : 'LOW';
}
