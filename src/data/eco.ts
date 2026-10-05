// Ecological layer — DEMO placeholders, replace with field/remote-sensing data.
// canopyPct: 0-100 canopy cover (protective dampener).
// roots: Deep (taproot/bamboo) | Mixed | Shallow (tea/scrub/jhum-fallow).
// drainage: Free | Partial | Blocked natural gullies (jhoras/nalas).
// intervention: active earthworks + toe support + spoil dumping (demo audit).
// glacial: moraine-lake / glacial catchment exposure (GLOF watch).

export interface Intervention {
  activity: string;
  toe: 'Supported' | 'Partial' | 'Exposed';
  spoil: boolean;
}

export interface EcoProfile {
  canopyPct: number;
  roots: 'Deep' | 'Mixed' | 'Shallow';
  drainage: 'Free' | 'Partial' | 'Blocked';
  intervention: Intervention;
  glacial: boolean;
}

const NONE: Intervention = { activity: 'None reported', toe: 'Supported', spoil: false };

export const ECO: Record<string, EcoProfile> = {
  'shillong-ekh': { canopyPct: 42, roots: 'Mixed', drainage: 'Partial', intervention: { activity: 'Urban hill cutting (Shillong fringe)', toe: 'Exposed', spoil: false }, glacial: false },
  'haflong-dima': { canopyPct: 58, roots: 'Mixed', drainage: 'Partial', intervention: { activity: 'Rail + NH-27 hill cutting', toe: 'Partial', spoil: true }, glacial: false },
  tawang: { canopyPct: 48, roots: 'Deep', drainage: 'Free', intervention: { activity: 'BRO road cutting (BCT axis)', toe: 'Supported', spoil: false }, glacial: false },
  'anini-dibang': { canopyPct: 78, roots: 'Deep', drainage: 'Free', intervention: NONE, glacial: true },
  noney: { canopyPct: 35, roots: 'Shallow', drainage: 'Blocked', intervention: { activity: 'Railway yard toe-cutting (Tupul)', toe: 'Exposed', spoil: true }, glacial: false },
  chandrapur: { canopyPct: 50, roots: 'Mixed', drainage: 'Partial', intervention: NONE, glacial: false },
  churachandpur: { canopyPct: 52, roots: 'Mixed', drainage: 'Partial', intervention: NONE, glacial: false },
  ukhrul: { canopyPct: 62, roots: 'Deep', drainage: 'Free', intervention: NONE, glacial: false },
  aizawl: { canopyPct: 30, roots: 'Shallow', drainage: 'Blocked', intervention: { activity: 'Ridge urban cutting + infill', toe: 'Exposed', spoil: true }, glacial: false },
  lunglei: { canopyPct: 55, roots: 'Mixed', drainage: 'Partial', intervention: NONE, glacial: false },
  kohima: { canopyPct: 46, roots: 'Mixed', drainage: 'Partial', intervention: { activity: 'NH-29 widening (Kohima–Dimapur)', toe: 'Partial', spoil: true }, glacial: false },
  mokokchung: { canopyPct: 60, roots: 'Mixed', drainage: 'Free', intervention: NONE, glacial: false },
  gangtok: { canopyPct: 38, roots: 'Mixed', drainage: 'Partial', intervention: { activity: 'NH-10 slip clearance + cutting', toe: 'Partial', spoil: false }, glacial: false },
  'lachen-nsikkim': { canopyPct: 40, roots: 'Mixed', drainage: 'Free', intervention: NONE, glacial: true },
  namchi: { canopyPct: 57, roots: 'Mixed', drainage: 'Free', intervention: NONE, glacial: false },
  guwahati: { canopyPct: 28, roots: 'Shallow', drainage: 'Blocked', intervention: { activity: 'Hillock cutting (city fringe)', toe: 'Exposed', spoil: true }, glacial: false },
  nongstoin: { canopyPct: 64, roots: 'Deep', drainage: 'Free', intervention: NONE, glacial: false },
  'agartala-fringe': { canopyPct: 45, roots: 'Shallow', drainage: 'Partial', intervention: NONE, glacial: false },
  bomdila: { canopyPct: 66, roots: 'Deep', drainage: 'Free', intervention: { activity: 'BCT road maintenance cutting', toe: 'Supported', spoil: false }, glacial: false },
};

export const ECO_DEFAULT: EcoProfile = { canopyPct: 55, roots: 'Mixed', drainage: 'Partial', intervention: NONE, glacial: false };

export function ecoOf(zoneId: string): EcoProfile {
  return ECO[zoneId] ?? ECO_DEFAULT;
}

// ---- Extended environmental metrics (DEMO estimates — replace with
// ISFR / Sentinel-2 / field surveys). Kept separate so the base table
// stays untouched.
export type LandUse = 'Dense Forest' | 'Degraded Forest' | 'Active Jhum' | 'Fallow Jhum' | 'Agriculture' | 'Settlement' | 'Road Corridor';

export interface EnvProfile {
  histCanopyPct: number;
  annualLossPct: number;
  landUse: LandUse;
  ndvi: number;
  ndviBase: number;
  bioSens: 1 | 2 | 3 | 4; // 1 LOW … 4 CRITICAL
  carbonHa: number;
  tempAnomC: number;
  lakeSens: 'LOW' | 'MODERATE' | 'HIGH';
}

const ENVX: Record<string, EnvProfile> = {
  'shillong-ekh': { histCanopyPct: 55, annualLossPct: 1.8, landUse: 'Degraded Forest', ndvi: 0.58, ndviBase: 0.66, bioSens: 3, carbonHa: 420, tempAnomC: 1.1, lakeSens: 'LOW' },
  'haflong-dima': { histCanopyPct: 70, annualLossPct: 1.5, landUse: 'Active Jhum', ndvi: 0.64, ndviBase: 0.72, bioSens: 4, carbonHa: 520, tempAnomC: 1.0, lakeSens: 'LOW' },
  tawang: { histCanopyPct: 58, annualLossPct: 0.7, landUse: 'Degraded Forest', ndvi: 0.55, ndviBase: 0.6, bioSens: 3, carbonHa: 380, tempAnomC: 1.3, lakeSens: 'MODERATE' },
  'anini-dibang': { histCanopyPct: 86, annualLossPct: 0.4, landUse: 'Dense Forest', ndvi: 0.78, ndviBase: 0.81, bioSens: 4, carbonHa: 610, tempAnomC: 1.4, lakeSens: 'HIGH' },
  noney: { histCanopyPct: 52, annualLossPct: 2.4, landUse: 'Road Corridor', ndvi: 0.48, ndviBase: 0.6, bioSens: 2, carbonHa: 350, tempAnomC: 1.0, lakeSens: 'LOW' },
  churachandpur: { histCanopyPct: 63, annualLossPct: 1.2, landUse: 'Fallow Jhum', ndvi: 0.6, ndviBase: 0.67, bioSens: 2, carbonHa: 300, tempAnomC: 1.0, lakeSens: 'LOW' },
  ukhrul: { histCanopyPct: 71, annualLossPct: 0.8, landUse: 'Dense Forest', ndvi: 0.7, ndviBase: 0.74, bioSens: 3, carbonHa: 330, tempAnomC: 1.1, lakeSens: 'LOW' },
  aizawl: { histCanopyPct: 47, annualLossPct: 2.1, landUse: 'Settlement', ndvi: 0.45, ndviBase: 0.58, bioSens: 2, carbonHa: 290, tempAnomC: 1.2, lakeSens: 'LOW' },
  lunglei: { histCanopyPct: 66, annualLossPct: 1.0, landUse: 'Fallow Jhum', ndvi: 0.62, ndviBase: 0.68, bioSens: 2, carbonHa: 280, tempAnomC: 1.0, lakeSens: 'LOW' },
  kohima: { histCanopyPct: 58, annualLossPct: 1.4, landUse: 'Road Corridor', ndvi: 0.56, ndviBase: 0.63, bioSens: 2, carbonHa: 310, tempAnomC: 1.1, lakeSens: 'LOW' },
  mokokchung: { histCanopyPct: 69, annualLossPct: 0.8, landUse: 'Agriculture', ndvi: 0.66, ndviBase: 0.71, bioSens: 1, carbonHa: 240, tempAnomC: 1.0, lakeSens: 'LOW' },
  gangtok: { histCanopyPct: 52, annualLossPct: 1.6, landUse: 'Settlement', ndvi: 0.52, ndviBase: 0.61, bioSens: 3, carbonHa: 300, tempAnomC: 1.2, lakeSens: 'MODERATE' },
  'lachen-nsikkim': { histCanopyPct: 50, annualLossPct: 0.6, landUse: 'Degraded Forest', ndvi: 0.44, ndviBase: 0.5, bioSens: 4, carbonHa: 410, tempAnomC: 1.4, lakeSens: 'HIGH' },
  namchi: { histCanopyPct: 66, annualLossPct: 0.9, landUse: 'Agriculture', ndvi: 0.64, ndviBase: 0.69, bioSens: 1, carbonHa: 220, tempAnomC: 1.0, lakeSens: 'LOW' },
  guwahati: { histCanopyPct: 44, annualLossPct: 2.6, landUse: 'Settlement', ndvi: 0.42, ndviBase: 0.55, bioSens: 2, carbonHa: 260, tempAnomC: 1.3, lakeSens: 'LOW' },
  nongstoin: { histCanopyPct: 73, annualLossPct: 0.7, landUse: 'Dense Forest', ndvi: 0.72, ndviBase: 0.76, bioSens: 3, carbonHa: 320, tempAnomC: 1.0, lakeSens: 'LOW' },
  'agartala-fringe': { histCanopyPct: 55, annualLossPct: 1.1, landUse: 'Agriculture', ndvi: 0.58, ndviBase: 0.64, bioSens: 1, carbonHa: 200, tempAnomC: 1.1, lakeSens: 'LOW' },
  bomdila: { histCanopyPct: 74, annualLossPct: 0.6, landUse: 'Dense Forest', ndvi: 0.71, ndviBase: 0.75, bioSens: 3, carbonHa: 340, tempAnomC: 1.2, lakeSens: 'MODERATE' },
};

const ENVX_DEFAULT: EnvProfile = { histCanopyPct: 65, annualLossPct: 1.0, landUse: 'Degraded Forest', ndvi: 0.6, ndviBase: 0.68, bioSens: 2, carbonHa: 300, tempAnomC: 1.1, lakeSens: 'LOW' };

export function envOf(zoneId: string): EnvProfile {
  return ENVX[zoneId] ?? ENVX_DEFAULT;
}

export function jhumCycle(landUse: LandUse): string | null {
  if (landUse === 'Active Jhum') return 'ACTIVE CLEARING';
  if (landUse === 'Fallow Jhum') return 'FALLOW';
  if (landUse === 'Degraded Forest') return 'EARLY REGROWTH';
  if (landUse === 'Dense Forest') return 'MATURE REGROWTH';
  return null;
}
