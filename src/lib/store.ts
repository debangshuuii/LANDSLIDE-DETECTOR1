import { useEffect, useState } from 'react';

export interface CommunityReport {
  id: string;
  place: string;
  district: string;
  state: string;
  date: string;
  severity: string;
  roadBlocked: boolean;
  description: string;
  status: 'NEW' | 'UNDER REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  photoName?: string;
  aiNote?: string;
}

export interface AlertItem {
  id: string;
  time: string;
  zoneId: string;
  zoneName: string;
  level: string;
  message: string;
  channel: string;
  acked: boolean;
}

const R_KEY = 'landslideguard-reports-v1';
const A_KEY = 'landslideguard-alerts-v1';

export function loadReports(): CommunityReport[] {
  try { return JSON.parse(localStorage.getItem(R_KEY) || '[]'); } catch { return []; }
}
export function saveReports(r: CommunityReport[]) { localStorage.setItem(R_KEY, JSON.stringify(r)); }
export function loadAlerts(): AlertItem[] {
  try { return JSON.parse(localStorage.getItem(A_KEY) || '[]'); } catch { return []; }
}
export function saveAlerts(a: AlertItem[]) { localStorage.setItem(A_KEY, JSON.stringify(a)); }

export function useLocalReports() {
  const [reports, setReports] = useState<CommunityReport[]>(() => loadReports());
  useEffect(() => { saveReports(reports); }, [reports]);
  return { reports, setReports };
}

export function useLocalAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => loadAlerts());
  useEffect(() => { saveAlerts(alerts); }, [alerts]);
  return { alerts, setAlerts };
}

// Heuristic "AI-assisted preliminary assessment" for uploaded photos.
// File-size + name based demo only — never a geological diagnosis.
export function photoPrelimAssessment(file: File): string {
  const mb = file.size / 1024 / 1024;
  const n = file.name.toLowerCase();
  const hints: string[] = [];
  if (/(debris|mud|slide|road|crack|rock)/.test(n)) hints.push('filename suggests visible debris/road feature');
  if (mb > 4) hints.push('high-resolution image — debris texture checkable');
  else hints.push('low/medium resolution — request closer geotagged photo');
  return `AI-assisted preliminary note (DEMO, not a diagnosis): ${hints.join('; ')}. Needs field verification by DDMA engineer.`;
}

export function trend24h(base: number, peakShift = 0): { t: string; risk: number }[] {
  const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
  return times.map((t, i) => {
    const curve = Math.sin((i / (times.length - 1)) * Math.PI) * 22;
    return { t, risk: Math.max(5, Math.min(98, Math.round(base - 12 + curve + peakShift))) };
  });
}
