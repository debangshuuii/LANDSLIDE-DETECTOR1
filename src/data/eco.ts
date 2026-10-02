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
