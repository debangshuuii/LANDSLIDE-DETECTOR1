// Highway corridor monitor — demo mapping of NH segments to monitored zones.
// Statuses derive from zone risk (not a live traffic feed — labeled clearly).

export interface CorridorSegment {
  corridor: string; // e.g. 'NH-6'
  name: string;     // segment label
  zoneIds: string[]; // monitored zones covering this segment
  lat: number;
  lon: number;
  bypass: string;
}

export const CORRIDORS: CorridorSegment[] = [
  { corridor: 'NH-6', name: 'Shillong → Jowai', zoneIds: ['shillong-ekh'], lat: 25.55, lon: 92.0, bypass: 'Via Nongstoin–Rongjeng (long detour)' },
  { corridor: 'NH-6', name: 'Aizawl → Silchar', zoneIds: ['aizawl'], lat: 23.9, lon: 92.7, bypass: 'Via Lunglei–Tlabung' },
  { corridor: 'NH-10', name: 'Gangtok → Siliguri (29th Mile)', zoneIds: ['gangtok', 'lachen-nsikkim'], lat: 27.2, lon: 88.55, bypass: 'Via Kalimpong–Lava (check BRO advisory)' },
  { corridor: 'NH-27', name: 'Haflong stretch', zoneIds: ['haflong-dima'], lat: 25.18, lon: 93.0, bypass: 'Lumding–Silchar rail / southern detour' },
  { corridor: 'NH-29', name: 'Kohima → Dimapur', zoneIds: ['kohima'], lat: 25.75, lon: 93.9, bypass: 'Via Wokha–Merapani' },
  { corridor: 'NH-37', name: 'Imphal → Silchar (Noney)', zoneIds: ['noney', 'churachandpur'], lat: 24.8, lon: 93.6, bypass: 'Via Churachandpur–Tipaimukh' },
  { corridor: 'BCT Rd', name: 'Tawang → Bomdila (Sela)', zoneIds: ['tawang', 'bomdila'], lat: 27.45, lon: 92.0, bypass: 'Sela tunnel (when open) / wait for BRO clearance' },
];

export type CorridorStatus = 'OPEN' | 'RESTRICTED' | 'BLOCKED';

// Worst zone risk along the segment decides status (demo rule).
export function corridorStatus(levels: string[]): CorridorStatus {
  if (levels.includes('CRITICAL')) return 'BLOCKED';
  if (levels.includes('HIGH')) return 'RESTRICTED';
  return 'OPEN';
}
