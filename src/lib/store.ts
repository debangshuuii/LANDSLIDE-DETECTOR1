import { useEffect, useState } from 'react';
import type { Lang } from './i18n';
import { t } from './i18n';

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
const MAX_ITEMS = 100;

function readArray(key: string): unknown[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export function loadReports(): CommunityReport[] { return readArray(R_KEY) as CommunityReport[]; }
export function saveReports(r: CommunityReport[]) {
  try { localStorage.setItem(R_KEY, JSON.stringify(r.slice(0, MAX_ITEMS))); } catch { /* quota/private mode: keep in memory */ }
}
export function loadAlerts(): AlertItem[] { return readArray(A_KEY) as AlertItem[]; }
export function saveAlerts(a: AlertItem[]) {
  try { localStorage.setItem(A_KEY, JSON.stringify(a.slice(0, MAX_ITEMS))); } catch { /* ignore */ }
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
export function photoPrelimAssessment(file: File, lang: Lang = 'en'): string {
  const mb = file.size / 1024 / 1024;
  const n = file.name.toLowerCase();
  const hints: string[] = [];
  if (/(debris|mud|slide|road|crack|rock)/.test(n)) hints.push(t(lang, 'aiDebris'));
  if (mb > 4) hints.push(t(lang, 'aiHiRes'));
  else hints.push(t(lang, 'aiLowRes'));
  return `${t(lang, 'aiPre')}: ${hints.join('; ')}. ${t(lang, 'aiVerify')}`;
}

export function trend24h(base: number, peakShift = 0): { t: string; risk: number }[] {
  const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
  return times.map((t, i) => {
    const curve = Math.sin((i / (times.length - 1)) * Math.PI) * 22;
    return { t, risk: Math.max(5, Math.min(98, Math.round(base - 12 + curve + peakShift))) };
  });
}
