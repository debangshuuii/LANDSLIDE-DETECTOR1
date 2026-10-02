import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { NER_ZONES, HISTORICAL_AVG_RAINFALL_24 } from './data/nerDistricts';
import { HISTORICAL_INCIDENTS } from './data/historical';
import { CORRIDORS, corridorStatus } from './data/corridors';
import { assessZone, WARNING_META, levelRank, type RiskLevel } from './lib/riskEngine';
import { fetchAllLiveWeather, loadCachedWeather, type LiveWeather } from './lib/weather';
import { fetchForecast72h, forecastTotal, type HourPoint } from './lib/forecast';
import { schematicTransect } from './lib/geo';
import { LANGS, t, tv, levelName, type Lang } from './lib/i18n';
import { useLocalAlerts, useLocalReports, makeId, trend24h, type CommunityReport } from './lib/store';
import GISMap from './components/GISMap';
import WhatIfPanel from './components/WhatIfPanel';
import CommunityForm from './components/CommunityForm';
import CorridorMonitor from './components/CorridorMonitor';
import Bulletin, { openBulletinPrint, type BulletinDoc } from './components/Bulletin';
import { bulletinRef, buildFullCsv, directives, downloadTextFile } from './lib/bulletin';

type Tab = 'Dashboard' | 'Risk Map' | 'Monitoring' | 'Predictions' | 'Alerts' | 'Incidents' | 'Infrastructure' | 'Reports' | 'Simulation' | 'Community' | 'Admin';

const TABS: Tab[] = ['Dashboard', 'Risk Map', 'Monitoring', 'Predictions', 'Alerts', 'Incidents', 'Infrastructure', 'Reports', 'Simulation', 'Community', 'Admin'];
function RiskGauge({ score, color }: { score: number; color: string }) {
  const R = 80, C = Math.PI * R;
  const s = Math.min(100, Math.max(0, score));
  const off = C * (1 - s / 100);
  const rad = ((180 - (s / 100) * 180) * Math.PI) / 180;
  const nx = 100 + R * 0.8 * Math.cos(rad), ny = 100 - R * 0.8 * Math.sin(rad);
  return (
    <svg viewBox="0 0 200 115" width="220" role="img" aria-label={`Risk gauge ${score} of 100`}>
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" className="gauge-arc-bg" strokeWidth="14" strokeLinecap="round" />
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" className="gauge-arc-fg" stroke={color} style={{ color, strokeDasharray: C, strokeDashoffset: off }} strokeWidth="14" strokeLinecap="round" />
      <line x1="100" y1="100" x2={nx} y2={ny} stroke={color} strokeWidth="3" />
      <circle cx="100" cy="100" r="6" fill={color} />
      <text x="100" y="86" textAnchor="middle" className="gauge-num" fontSize="26">{score}</text>
    </svg>
  );
}

const TAB_KEYS: Record<Tab, string> = { Dashboard: 'dashboard', 'Risk Map': 'riskmap', Monitoring: 'monitoring', Predictions: 'predictions', Alerts: 'alerts', Incidents: 'incidents', Infrastructure: 'infrastructure', Reports: 'reports', Simulation: 'simulation', Community: 'community', Admin: 'admin' };

const NAV_GROUPS: { key: string; tabs: { id: Tab; icon: string }[] }[] = [
  { key: 'grpSurv', tabs: [{ id: 'Dashboard', icon: '📊' }, { id: 'Risk Map', icon: '🗺️' }, { id: 'Monitoring', icon: '🌧️' }] },
  { key: 'grpAI', tabs: [{ id: 'Predictions', icon: '📈' }, { id: 'Simulation', icon: '🧪' }, { id: 'Incidents', icon: '📜' }] },
  { key: 'grpOps', tabs: [{ id: 'Alerts', icon: '🔔' }, { id: 'Infrastructure', icon: '🛣️' }, { id: 'Reports', icon: '📄' }] },
  { key: 'grpField', tabs: [{ id: 'Community', icon: '📸' }, { id: 'Admin', icon: '🛡️' }] },
];

function csvCell(v: string): string {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // stop Excel formula injection
  return `"${safe.replace(/"/g, '""')}"`; // quote commas/quotes/newlines
}

export function exportRiskCsv(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); // needed for Safari
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export type MergedZone = {
  zone: typeof NER_ZONES[number] & { rainfall24mm: number; rainfall7dmm: number; soilMoisturePct: number };
  live: boolean;
  risk: ReturnType<typeof assessZone>;
};

// Pure merge: demo base overwritten by live rain when ON. Top-level so the
// print handler can rebuild from freshly fetched data (never a stale snapshot).
export function mergeZones(liveData: Record<string, LiveWeather>, useLiveFlag: boolean, boost: number, lang: Lang = 'en'): MergedZone[] {
  return NER_ZONES.map(z => {
    const L = (useLiveFlag && liveData[z.id]) ? liveData[z.id] : null;
    const base = {
      ...z,
      rainfall24mm: L ? L.rain24mm : z.rainfall24mm,
      rainfall7dmm: L ? L.rain7dmm : z.rainfall7dmm,
      soilMoisturePct: L ? L.soilEstPct : z.soilMoisturePct,
    };
    return {
      zone: base,
      live: !!L,
      risk: assessZone(base, boost ? { rainfall24mm: base.rainfall24mm + boost, soilMoisturePct: Math.min(96, base.soilMoisturePct + boost / 6) } : undefined, lang),
    };
  });
}

export function overallOf(merged: MergedZone[]): RiskLevel {
  const critical = merged.filter(z => z.risk.level === 'CRITICAL').length;
  const high = merged.filter(z => z.risk.level === 'HIGH').length;
  if (critical > 0) return 'CRITICAL';
  if (high > 0) return 'HIGH';
  if (merged.length > 0 && merged.every(z => z.risk.level === 'LOW')) return 'LOW';
  return 'MODERATE';
}

// Pure bulletin builder: same input → same bulletin, whenever it is called.
export function makeBulletinDoc(args: {
  merged: MergedZone[]; warnings: number; communityCount: number;
  refNo: string; issuedAt: string; sourceLabel: string; boost: number; focus: string;
}): BulletinDoc {
  const { merged, warnings, communityCount, refNo, issuedAt, sourceLabel, boost, focus } = args;
  const sorted = [...merged].sort((a, b) => b.risk.score - a.risk.score);
  const overall = overallOf(merged);
  const peak = sorted.reduce((a, b) => (b.zone.rainfall24mm + boost > a.zone.rainfall24mm + boost ? b : a), sorted[0]);
  const anomalyCount = sorted.filter(z => z.zone.rainfall24mm + boost > HISTORICAL_AVG_RAINFALL_24).length;
  const avgMoist = Math.round(sorted.reduce((s, z) => s + Math.min(96, z.zone.soilMoisturePct + boost / 6), 0) / Math.max(1, sorted.length));
  const lvl = (id: string) => merged.find(z => z.zone.id === id)?.risk.level ?? 'LOW';
  return {
    refNo, issuedAt, sourceLabel, overall, focus,
    zones: merged.length,
    severe: merged.filter(z => z.risk.level === 'HIGH' || z.risk.level === 'CRITICAL').length,
    warnings,
    exposed: merged.reduce((s, z) => s + z.zone.populationExposed, 0),
    maxRain: Math.round(peak.zone.rainfall24mm + boost),
    maxPlace: `${peak.zone.place}, ${peak.zone.district}`,
    anomalyCount, avgMoist,
    rows: sorted.map(z => {
      // Official bulletin is always English (GOI document), even when the
      // site UI is in another language — recompute English text from numbers.
      const en = assessZone(z.zone, boost ? { rainfall24mm: z.zone.rainfall24mm + boost, soilMoisturePct: Math.min(96, z.zone.soilMoisturePct + boost / 6) } : undefined, 'en');
      return {
        zoneId: z.zone.id, place: z.zone.place, district: z.zone.district, state: z.zone.state,
        lat: z.zone.lat, lon: z.zone.lon, elevationM: z.zone.elevationM, slopeDeg: z.zone.slopeDeg, soil: z.zone.soil,
        rain24mm: Math.round(z.zone.rainfall24mm + boost), rain7dmm: Math.round(z.zone.rainfall7dmm + boost * 2),
        soilMoisturePct: Math.min(96, Math.round(z.zone.soilMoisturePct + boost / 6)),
        score: z.risk.score, level: z.risk.level, reasons: en.reasons.length > 0 ? en.reasons : ['Baseline terrain susceptibility'],
        roads: z.zone.roads, infrastructure: z.zone.infrastructure,
        populationExposed: z.zone.populationExposed, action: en.action,
      };
    }),
    corridors: CORRIDORS.map(c => ({ corridor: c.corridor, name: c.name, status: corridorStatus(c.zoneIds.map(lvl)), bypass: c.bypass })),
    directives: directives(overall, sorted[0].zone.place),
    communityCount,
  };
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [lang, setLang] = useState<Lang>('en'); // whole-site language (nav + content + risk text)
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('shillong-ekh');
  const [demoBoost, setDemoBoost] = useState(0); // mm added by demo simulation
  const [layers, setLayers] = useState({ risk: true, rain: true, hist: true, infra: false });
  const [bootTime] = useState(() => new Date().toLocaleString()); // stable timestamp, not re-rendered
  // --- LIVE WEATHER (Step 1) ---
  const [useLive, setUseLive] = useState(false);
  const [live, setLive] = useState<Record<string, LiveWeather>>(() => loadCachedWeather()?.data ?? {});
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [liveAt, setLiveAt] = useState<string>(() => {
    try { const c = loadCachedWeather(); const k = c && Object.values(c.data)[0]; return k?.updatedAt ?? ''; } catch { return ''; }
  });
  useEffect(() => {
    if (!useLive) return;
    if (Object.keys(live).length > 0) return; // already have fresh cache
    let cancelled = false;
    setLiveLoading(true); setLiveError('');
    fetchAllLiveWeather(NER_ZONES.map(z => ({ id: z.id, lat: z.lat, lon: z.lon })))
      .then(d => {
        if (cancelled) return;
        setLive(d);
        const first = Object.values(d)[0];
        if (first) setLiveAt(first.updatedAt);
        if (Object.keys(d).length === 0) setLiveError(t(lang, 'fetchFail'));
      })
      .catch(() => { if (!cancelled) setLiveError(t(lang, 'noNet')); })
      .finally(() => { if (!cancelled) setLiveLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLive]);
  const { reports, setReports } = useLocalReports();
  const { alerts, setAlerts } = useLocalAlerts();

  // Merge: demo numbers are the base; live rain overwrites them when ON.
  const zones = useMemo(() => mergeZones(live, useLive, demoBoost, lang), [demoBoost, useLive, live, lang]);

  const sorted = useMemo(() => [...zones].sort((a, b) => b.risk.score - a.risk.score), [zones]);
  const selected = zones.find(z => z.zone.id === selectedId) ?? sorted[0];
  const counts = useMemo(() => ({
    critical: zones.filter(z => z.risk.level === 'CRITICAL').length,
    high: zones.filter(z => z.risk.level === 'HIGH').length,
    warnings: alerts.filter(a => !a.acked).length,
    exposed: zones.reduce((s, z) => s + z.zone.populationExposed, 0),
  }), [zones, alerts]);

  const overall: RiskLevel = useMemo(() => overallOf(zones), [zones]);
  const norm = (s: string) => s.trim().toLowerCase();
  // Ranked search across place/district/state/roads (placeholder promises roads).
  const scored = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return zones
      .map(z => {
        const place = norm(z.zone.place), dist = norm(z.zone.district), st = norm(z.zone.state);
        const roads = z.zone.roads.map(norm);
        let score = 0;
        if (place.startsWith(q)) score += 3;
        else if (place.includes(q)) score += 2;
        if (dist.includes(q)) score += 1.5;
        if (st.includes(q)) score += 1;
        if (roads.some(r => r.includes(q))) score += 1;
        return { z, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.z);
  }, [query, zones]);
  const [searchMsg, setSearchMsg] = useState('');
  const [focusTick, setFocusTick] = useState(0); // bump on every search/click → map flies there
  const goToZone = (id: string) => {
    setSelectedId(id);
    setSearchMsg('');
    setFocusTick(t => t + 1); // direct zoom-in, even right after tab switch remount
    setTab('Risk Map'); // FlyToSelected pans/zooms the map there
  };
  const runSearch = () => {
    const q = norm(query);
    if (!q) { setSearchMsg(t(lang, 'typePlace')); return; }
    if (scored.length === 0) { setSearchMsg(tv(lang, 'noMatch', query.trim())); return; }
    goToZone(scored[0].zone.id);
  };

  const pushAlert = (zoneId: string, level: RiskLevel, message: string) => {
    const z = NER_ZONES.find(v => v.id === zoneId);
    const item = { id: makeId('a'), time: new Date().toLocaleString(), zoneId, zoneName: z ? `${z.place}, ${z.district}` : zoneId, level, message, channel: 'Dashboard + Mock SMS/Email (SIMULATION)', acked: false };
    setAlerts(prev => [item, ...prev].slice(0, 100)); // cap so localStorage never overflows
  };

  const runHeavyRainSim = () => {
    const top = sorted[0];
    // Recompute WITH the +80 boost so the message shows the new score, not the old one.
    const after = assessZone(
      { ...top.zone, rainfall24mm: top.zone.rainfall24mm + 80, soilMoisturePct: Math.min(96, top.zone.soilMoisturePct + 80 / 6) },
      { rainfall24mm: top.zone.rainfall24mm + 80, soilMoisturePct: Math.min(96, top.zone.soilMoisturePct + 80 / 6) },
      lang,
    );
    setDemoBoost(80);
    pushAlert(top.zone.id, after.level, tv(lang, 'mSim', { p: top.zone.place, s: after.score, l: levelName(lang, after.level) }));
    setTab('Risk Map');
  };

  const refreshLive = () => {
    setLiveLoading(true); setLiveError('');
    fetchAllLiveWeather(NER_ZONES.map(z => ({ id: z.id, lat: z.lat, lon: z.lon })))
      .then(d => {
        setLive(d); const f = Object.values(d)[0]; if (f) setLiveAt(f.updatedAt);
        if (Object.keys(d).length === 0) setLiveError(t(lang, 'fetchFail'));
        else if (!useLive) setUseLive(true);
      })
      .catch(() => setLiveError(t(lang, 'noNet')))
      .finally(() => setLiveLoading(false));
  };

  const trend = trend24h(selected.risk.score, demoBoost ? 8 : 0);
  const rainBars = sorted.slice(0, 8).map(z => ({ name: z.zone.place, mm: Math.round(z.zone.rainfall24mm + demoBoost) }));
  const [bulRef] = useState(() => bulletinRef());
  const levelOf = (zoneId: string) => zones.find(z => z.zone.id === zoneId)?.risk.level ?? 'LOW';
  const statusLabel = (s: string) => s === 'UNDER REVIEW' ? t(lang, 'stReview') : s === 'VERIFIED' ? t(lang, 'stVerified') : s === 'REJECTED' ? t(lang, 'stRejected') : s === 'RESOLVED' ? t(lang, 'stResolved') : t(lang, 'stNew');
  const focusLabel = `${selected.zone.place}, ${selected.zone.district} — ${selected.risk.score}/100 ${selected.risk.level}`;
  const sourceLabel = useLive ? `LIVE (Open-Meteo${liveAt ? `, synced ${liveAt}` : ''})` : t(lang, 'simBadge');
  // On-screen preview (stable ref). The printed PDF is rebuilt FRESH at click
  // time with a new ref + timestamp — see printLiveBulletin below.
  const bulletinDoc: BulletinDoc = useMemo(() => makeBulletinDoc({
    merged: zones, warnings: alerts.length, communityCount: reports.length,
    refNo: bulRef, issuedAt: new Date().toLocaleString(), sourceLabel, boost: demoBoost, focus: focusLabel,
  }), [zones, alerts.length, reports.length, bulRef, sourceLabel, demoBoost, focusLabel]);
  const [printBusy, setPrintBusy] = useState('');
  // LIVE print: re-sync rain, rebuild everything from current time + place,
  // then open the PDF. Every download differs by timestamp + live data.
  const printLiveBulletin = async () => {
    setPrintBusy('Syncing live data…');
    try {
      let liveData = live;
      let label = sourceLabel;
      if (useLive) {
        const fresh = await fetchAllLiveWeather(NER_ZONES.map(z => ({ id: z.id, lat: z.lat, lon: z.lon })));
        if (Object.keys(fresh).length > 0) {
          setLive(fresh);
          const f = Object.values(fresh)[0];
          if (f) setLiveAt(f.updatedAt);
          liveData = fresh;
          label = `LIVE (Open-Meteo, synced ${f.updatedAt})`;
        }
      }
      const now = new Date();
      const merged = mergeZones(liveData, useLive, demoBoost, lang);
      const sel = merged.find(z => z.zone.id === selectedId) ?? merged[0];
      const doc = makeBulletinDoc({
        merged, warnings: alerts.length, communityCount: reports.length,
        refNo: bulletinRef(now), issuedAt: now.toLocaleString(), sourceLabel: label, boost: demoBoost,
        focus: `${sel.zone.place}, ${sel.zone.district} — ${sel.risk.score}/100 ${sel.risk.level}`,
      });
      setPrintBusy('');
      if (!openBulletinPrint(doc)) alert(t(lang, 'popBlocked'));
    } catch {
      setPrintBusy('');
      alert('Live sync failed — check connection and retry.');
    }
  };
  const transect = useMemo(() => schematicTransect(selected.zone.elevationM, selected.zone.slopeDeg), [selected.zone.elevationM, selected.zone.slopeDeg]);
  // 72h outlook for the selected zone (fetched on demand in Predictions).
  const [fc, setFc] = useState<HourPoint[]>([]);
  const [fcLoading, setFcLoading] = useState(false);
  const [fcError, setFcError] = useState('');
  const [fcFor, setFcFor] = useState('');
  useEffect(() => {
    if (tab !== 'Predictions') return;
    const id = selected.zone.id;
    if (fcFor === id && fc.length > 0) return;
    let cancelled = false;
    setFcLoading(true); setFcError('');
    fetchForecast72h(selected.zone.lat, selected.zone.lon, id)
      .then(h => { if (!cancelled) { setFc(h); setFcFor(id); } })
      .catch(() => { if (!cancelled) setFcError('Forecast unavailable — check connection.'); })
      .finally(() => { if (!cancelled) setFcLoading(false); });
    return () => { cancelled = true; };
  }, [tab, selected.zone.id, selected.zone.lat, selected.zone.lon]);

  return (
    <>
      <div className="topbar">
        <div className="brand">⛰️ NER LandslideGuard<small>SIH26001 · MDoNER · DISASTER MGMT · DEMO/SIMULATION MODE</small></div>
        <div className="search" style={{ position: 'relative' }}>
          <label htmlFor="site-search" className="muted" style={{ alignSelf: 'center' }}>{t(lang, 'search')}</label>
          <input id="site-search" placeholder="State / district / village / road — e.g. Shillong" value={query} onChange={e => { setQuery(e.target.value); setSearchMsg(''); }} onKeyDown={e => { if (e.key === 'Enter') runSearch(); }} autoComplete="off" />
          <button className="btn" onClick={runSearch}>{t(lang, 'go')}</button>
          {norm(query) && scored.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d1628', border: '1px solid #22345c', borderRadius: 8, marginTop: 4, zIndex: 1200, overflow: 'hidden' }}>
              {scored.slice(0, 6).map(s => (
                <button key={s.zone.id} className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', borderRadius: 0 }} onClick={() => goToZone(s.zone.id)}>
                  {s.zone.place} <span className="muted">· {s.zone.district}, {s.zone.state} · {s.risk.score} {levelName(lang, s.risk.level)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {searchMsg && <span className="muted" role="status">{searchMsg}</span>}
        <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? t(lang, 'liveBadge') : t(lang, 'simBadge')}</span>
        <label className="muted" htmlFor="lang-sel" style={{ alignSelf: 'center' }}>🌐</label>
        <select id="lang-sel" value={lang} onChange={e => setLang(e.target.value as Lang)} style={{ width: 'auto' }} aria-label="Language">
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button className="btn" onClick={() => setUseLive(v => !v)} title="Beginner: this one switch swaps demo numbers for real API rain">{useLive ? t(lang, 'demoData') : t(lang, 'liveRain')}</button>
        <button className="btn" onClick={refreshLive}>{liveLoading ? 'Fetching…' : t(lang, 'refresh')}</button>
        <button className="btn" onClick={() => setTab('Alerts')}>🔔 {t(lang, 'alerts')} ({counts.warnings})</button>
        <button className="btn primary" onClick={runHeavyRainSim}>{t(lang, 'heavyRain')}</button>
        {demoBoost > 0 && <button className="btn" onClick={() => setDemoBoost(0)}>{t(lang, 'resetSim')}</button>}
      </div>
      <div className="ticker" aria-hidden="true"><span className="ticker-inner">
        {[...sorted.slice(0, 6), ...sorted.slice(0, 6)].map((z, i) => (
          <span key={i} style={{ marginRight: 36 }}>{z.risk.level === 'CRITICAL' ? '🔴' : z.risk.level === 'HIGH' ? '🟠' : z.risk.level === 'MODERATE' ? '🟡' : '🟢'} {levelName(lang, z.risk.level)}: {z.zone.place} {Math.round(z.zone.rainfall24mm + demoBoost)}mm/24h · </span>
        ))}
        <span style={{ marginRight: 36 }}>{t(lang, 'tickerLive')}</span>
      </span></div>
      <div className="disclaimer">{t(lang, 'dRisk')} {useLive ? <span>{t(lang, 'dLive')}{liveAt && `, ${tv(lang, 'fetched', liveAt)}`}; {t(lang, 'dEst')}</span> : <span>{t(lang, 'dDemo')}</span>} {liveError && <span> ⚠ {liveError}</span>} {t(lang, 'dHist')}</div>

      <div className="layout">
        <nav className="nav" role="tablist" aria-label="Main sections">
          {NAV_GROUPS.map(g => (
            <div key={g.key}>
              <div className="nav-group">{t(lang, g.key)}</div>
              {g.tabs.map(tb => (
                <button key={tb.id} role="tab" aria-selected={tab === tb.id} className={tab === tb.id ? 'active' : ''} onClick={() => setTab(tb.id)}>
                  <span className="ico" aria-hidden="true">{tb.icon}</span>{t(lang, TAB_KEYS[tb.id])}
                  {tb.id === 'Alerts' && counts.warnings > 0 && <span className="alert-badge">{counts.warnings}</span>}
                </button>
              ))}
            </div>
          ))}
          <div className="muted" style={{ padding: '10px 6px' }}>MONITOR → ANALYZE → PREDICT → WARN → RESPOND</div>
        </nav>

        <div className="main">
          {tab === 'Dashboard' && (
            <div className="grid">
              <div className="card">
                <h3>{t(lang, 'regRisk')} — <span className="riskpill" style={{ background: overall === 'CRITICAL' ? '#ef4444' : overall === 'HIGH' ? '#f97316' : overall === 'LOW' ? '#22c55e' : '#eab308', color: '#111' }}>{levelName(lang, overall)} · {WARNING_META[overall].code}</span></h3>
                <p className="muted">{t(lang, 'highest')}: <b>{sorted[0].zone.place}</b> — {sorted[0].risk.score}/100 ({levelName(lang, sorted[0].risk.level)}). {useLive ? t(lang, 'recomputedLive') : t(lang, 'recomputedSim')}. {t(lang, 'lastUpd')}: {useLive && liveAt ? liveAt : bootTime} · Status: <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? t(lang, 'liveBadge') : t(lang, 'simBadge')}</span></p>
                <div className="grid g4">
                  <div className="card"><div className="muted">{t(lang, 'areasMon')}</div><div className="stat mono">{zones.length}</div><div className="kpi-sub"><span className="beacon" />{t(lang, 'kpiActive')} · {new Set(zones.map(z => z.zone.state)).size} {t(lang, 'kpiStates')}</div></div>
                  <div className={counts.high + counts.critical > 0 ? 'card glow-red' : 'card'}><div className="muted">{t(lang, 'highCrit')}</div><div className="stat mono">{counts.high + counts.critical}</div><div className="progress"><div style={{ width: `${Math.min(100, Math.round(((counts.high + counts.critical) / Math.max(1, zones.length)) * 100))}%` }} /></div><div className="kpi-sub">{counts.high + counts.critical} / {zones.length}</div></div>
                  <div className="card"><div className="muted">{t(lang, 'activeWarn')}</div><div className="stat mono">{counts.warnings}</div><div className="kpi-sub">{t(lang, 'earlyWarn').split('(')[0]}</div></div>
                  <div className="card"><div className="muted">{t(lang, 'popExp')}</div><div className="stat mono">{(counts.exposed / 1000).toFixed(0)}k</div><div className="kpi-sub">{zones.length} {t(lang, 'thZone')} · {t(lang, 'potExp')}</div></div>
                </div>
              </div>
              <div className="grid g2">
                <div className="card"><h3>{t(lang, 'topZones')}</h3>
                  <div className="tablewrap"><table className="table"><thead><tr><th>{t(lang, 'thPlace')}</th><th>{t(lang, 'thRain')}</th><th>{t(lang, 'thScore')}</th><th>{t(lang, 'thLevel')}</th></tr></thead><tbody>
                    {sorted.slice(0, 6).map(z => <tr key={z.zone.id}><td><button className="btn" onClick={() => goToZone(z.zone.id)}>{z.zone.place}</button><div className="muted">{z.zone.district}, {z.zone.state} {z.live ? `· 🟢${t(lang, 'liveTag')}` : `· ${t(lang, 'demoTag')}`}</div></td><td>{Math.round(z.zone.rainfall24mm + demoBoost)} mm</td><td>{z.risk.score}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{levelName(lang, z.risk.level)}</span></td></tr>)}
                  </tbody></table></div>
                </div>
                <div className="card"><h3>{tv(lang, 'rainChart', HISTORICAL_AVG_RAINFALL_24)} ({useLive ? t(lang, 'liveTag') : t(lang, 'demoTag')}, top 8)</h3>
                  {rainBars.length === 0 ? <p className="muted">{t(lang, 'noData')}</p> : (
                  <ResponsiveContainer width="100%" height={260}><BarChart data={rainBars} margin={{ bottom: 40 }}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="name" tick={{ fill: '#93a4c4', fontSize: 11 }} interval="preserveStartEnd" tickFormatter={(v: string) => v.slice(0, 9)} angle={-20} height={60} /><YAxis tick={{ fill: '#93a4c4' }} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Bar dataKey="mm" fill="#38bdf8" /></BarChart></ResponsiveContainer>)}
                </div>
              </div>
              <div className="card"><h3>{t(lang, 'judgeDemo')}</h3>
                <ol className="steps muted">
                  <li>{t(lang, 's1')}</li>
                  <li>{t(lang, 's2')}</li>
                  <li>{t(lang, 's3')}</li>
                  <li>{t(lang, 's4')}</li>
                  <li>{t(lang, 's5')}</li>
                </ol>
              </div>
            </div>
          )}

          {tab === 'Risk Map' && (
            <div className="grid">
              <div className="card">
                <h3>{t(lang, 'riskmap')} — GIS <span className="badge sim">DEMO LAYERS</span></h3>
                <Suspense fallback={<p className="muted">{t(lang, 'loadingMap')}</p>}>
                  <GISMap
                    zones={zones.map(z => ({ zone: z.zone, live: z.live, risk: { score: z.risk.score, level: z.risk.level, color: z.risk.color, reasons: z.risk.reasons }, rain24: z.zone.rainfall24mm + demoBoost }))}
                    layers={layers} setLayers={setLayers} selectedId={selected.zone.id} focusTick={focusTick} demoBoost={demoBoost} lang={lang} useLive={useLive}
                    onToggleLive={() => setUseLive(v => !v)}
                    onSelect={(id) => { setSelectedId(id); }}
                  />
                </Suspense>
              </div>
              <div className="card">
                <h3>{t(lang, 'locDetail')} — {selected.zone.place}, {selected.zone.district}</h3>
                <div className="gauge-wrap">
                  <RiskGauge score={selected.risk.score} color={selected.risk.color} />
                  <div>
                    <div><span className="riskpill" style={{ background: selected.risk.color }}>{selected.risk.score}/100 · {levelName(lang, selected.risk.level)}</span></div>
                    <div className="muted" style={{ marginTop: 6 }}>{tv(lang, 'probEst', selected.risk.probabilityPct)} · {t(lang, 'estProb')}</div>
                  </div>
                </div>
                {selected.risk.factors.map(f => <div key={f.name} style={{ margin: '6px 0' }}><div className="row" style={{ justifyContent: 'space-between' }}><span>{f.name}</span><span className="muted">{f.detail} · {Math.round(f.value)}%</span></div><div className="factorbar"><div style={{ width: `${f.value}%`, background: selected.risk.color }} /></div></div>)}
                <h3>{t(lang, 'whyRisk')}</h3>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p className="muted">{t(lang, 'idCheck')}: <b style={{ color: selected.risk.id.exceeded ? '#ef4444' : '#22c55e' }}>{selected.risk.id.exceeded ? t(lang, 'exceeded') : t(lang, 'okWord')}</b> — {selected.risk.id.note}</p>
                <h3>{t(lang, 'terrainSchem')}</h3>
                <ResponsiveContainer width="100%" height={140}><AreaChart data={transect} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="x" tick={false} /><YAxis tick={{ fill: '#93a4c4', fontSize: 11 }} domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Area type="monotone" dataKey="m" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} /></AreaChart></ResponsiveContainer>
                <p className="muted">{tv(lang, 'schemNote', selected.zone.elevationM)}</p>
                <p><b>{t(lang, 'recAction')}:</b> {selected.risk.action}</p>
                <p className="muted">{selected.zone.elevationM} m · {selected.zone.slopeDeg}° · {selected.zone.soil} · {selected.zone.histCount5y}/5y · {t(lang, 'dataStatus')}: {selected.live ? t(lang, 'liveEst') : t(lang, 'simBadge')} · {useLive && liveAt ? tv(lang, 'rainFetched', liveAt) : `${t(lang, 'srcDemo')}, ${bootTime}`}</p>
                <div className="row">
                  <button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, tv(lang, 'mManual', { p: `${selected.zone.place}, ${selected.zone.district}`, s: selected.risk.score, l: levelName(lang, selected.risk.level), r: selected.risk.reasons[0] ?? '', a: selected.risk.action }))}>{t(lang, 'genWarn')}</button>
                  <button className="btn" onClick={() => setTab('Simulation')}>{t(lang, 'openSim')}</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Monitoring' && (
            <div className="grid">
              <div className="card"><h3>{t(lang, 'rainMon')} <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? t(lang, 'liveFeed') : t(lang, 'simFeed')}</span></h3>
                <div className="tablewrap"><table className="table"><thead><tr><th>{t(lang, 'thZone')}</th><th>{t(lang, 'th24')}</th><th>{t(lang, 'th7')}</th><th>{tv(lang, 'thAnom', HISTORICAL_AVG_RAINFALL_24)}</th><th>{t(lang, 'thMoist')}</th></tr></thead><tbody>
                  {sorted.map(z => { const cur = Math.round(z.zone.rainfall24mm + demoBoost); const an = Math.round(((cur - HISTORICAL_AVG_RAINFALL_24) / HISTORICAL_AVG_RAINFALL_24) * 100); return <tr key={z.zone.id}><td>{z.zone.place}</td><td>{cur} mm</td><td>{Math.round(z.zone.rainfall7dmm + demoBoost * 2)} mm</td><td style={{ color: an > 50 ? '#ef4444' : an > 0 ? '#eab308' : '#22c55e' }}>{an > 0 ? `+${an}%` : `${an}%`}</td><td>{Math.min(96, Math.round(z.zone.soilMoisturePct + demoBoost / 6))}%</td></tr>; })}
                </tbody></table></div>
                <p className="muted">{tv(lang, 'monSrc', { s: useLive ? 'Open-Meteo forecast API (free, no key)' : t(lang, 'simBadge'), u: useLive && liveAt ? liveAt : bootTime, m: useLive ? t(lang, 'liveEst') : t(lang, 'simBadge') })}</p>
              </div>
            </div>
          )}

          {tab === 'Predictions' && (
            <div className="grid g2">
              <div className="card"><h3>{t(lang, 'trend24')} — {selected.zone.place} <span className="badge sim">{t(lang, 'modelPred')}</span></h3>
                <ResponsiveContainer width="100%" height={280}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="t" tick={{ fill: '#93a4c4' }} /><YAxis tick={{ fill: '#93a4c4' }} domain={[0, 100]} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={3} dot /></LineChart></ResponsiveContainer>
                <p className="muted">{t(lang, 'estTraj')}</p>
                <div className="row">{zones.slice(0, 6).map(z => <button key={z.zone.id} className="btn" onClick={() => setSelectedId(z.zone.id)}>{z.zone.place}</button>)}</div>
              </div>
              <div className="card"><h3>{t(lang, 'aiExplain')}</h3>
                <p>{t(lang, 'trend24')}: <b>{selected.risk.score}% ({levelName(lang, selected.risk.level)})</b> · {t(lang, 'confidence')}</p>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p className="muted">{t(lang, 'inputsNote')}</p>
                <h3>{t(lang, 'fcTitle')} — {selected.zone.place} <span className="badge live">{t(lang, 'liveFc')}</span></h3>
                {fcLoading && <p className="muted">{t(lang, 'fcLoading')}</p>}
                {fcError && <p className="muted">{t(lang, 'fcError')}</p>}
                {!fcLoading && !fcError && fc.length > 0 && (
                  <><ResponsiveContainer width="100%" height={200}><BarChart data={fc}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="time" tick={{ fill: '#93a4c4', fontSize: 10 }} interval="preserveStartEnd" /><YAxis tick={{ fill: '#93a4c4' }} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Bar dataKey="mm" fill="#38bdf8" /></BarChart></ResponsiveContainer>
                  <p className="muted">{tv(lang, 'fcTotal', forecastTotal(fc))}</p></>
                )}
              </div>
            </div>
          )}

          {tab === 'Alerts' && (
            <div className="grid">
              <div className="card"><h3>{t(lang, 'earlyWarn')}</h3>
                <div className="row"><button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, tv(lang, 'mAuto', { p: selected.zone.place, s: selected.risk.score, l: levelName(lang, selected.risk.level) }))}>{tv(lang, 'genFor', selected.zone.place)}</button>
                {alerts.length > 0 && <button className="btn danger" onClick={() => { if (window.confirm(tv(lang, 'clearConfirm', alerts.length))) setAlerts([]); }}>{tv(lang, 'clearAll', alerts.length)}</button>}</div>
                {alerts.length === 0 && <p className="muted">{t(lang, 'noAlerts')}</p>}
                {alerts.map(a => <div key={a.id} className="card alert" style={{ marginTop: 10 }}><b>[{levelName(lang, a.level)}] {a.zoneName}</b> <span className="muted">{a.time}</span><p>{a.message}</p><p className="muted">{t(lang, 'thSource')}: {a.channel} — {t(lang, 'chNote')}</p><div className="row"><button className="btn" onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, acked: !x.acked } : x))}>{a.acked ? t(lang, 'unack') : t(lang, 'ack')}</button></div></div>)}
              </div>
            </div>
          )}

          {tab === 'Incidents' && (
            <div className="card"><h3>{t(lang, 'histDb')} <span className="badge sim">{t(lang, 'histBadge')}</span></h3>
              <div className="tablewrap"><table className="table"><thead><tr><th>{t(lang, 'thDate')}</th><th>{t(lang, 'thPlace')}</th><th>{t(lang, 'thTrigger')}</th><th>{t(lang, 'thSev')}</th><th>{t(lang, 'thImpact')}</th><th>{t(lang, 'thSource')}</th></tr></thead><tbody>
                {HISTORICAL_INCIDENTS.map(h => <tr key={h.id}><td>{h.date}</td><td>{h.place}<div className="muted">{h.district}, {h.state} {h.demo && '(DEMO)'}</div></td><td>{h.trigger}</td><td>{h.severity}</td><td>{h.infraImpact}</td><td className="muted">{h.source}</td></tr>)}
              </tbody></table></div>
            </div>
          )}

          {tab === 'Infrastructure' && (
            <div className="grid">
              <CorridorMonitor levelOf={levelOf} lang={lang} />
              <div className="card"><h3>{t(lang, 'critInfra')} <span className="badge sim">{t(lang, 'potExp')}</span></h3>
              <div className="tablewrap"><table className="table"><thead><tr><th>{t(lang, 'thZone')}</th><th>{t(lang, 'thRisk')}</th><th>{t(lang, 'thRoads')}</th><th>{t(lang, 'thInfra')}</th><th>{t(lang, 'thPop')}</th></tr></thead><tbody>
                {sorted.filter(z => levelRank(z.risk.level) >= 2).map(z => <tr key={z.zone.id}><td>{z.zone.place}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{levelName(lang, z.risk.level)}</span></td><td>{z.zone.roads.join('; ')}</td><td>{z.zone.infrastructure.join('; ')}</td><td>{z.zone.populationExposed.toLocaleString()}</td></tr>)}
              </tbody></table></div>
              <p className="muted">{t(lang, 'roadNote')}</p>
              </div>
            </div>
          )}

          {tab === 'Reports' && (
            <div className="grid">
              <div className="card no-print"><h3>{t(lang, 'bulTitle')} — {bulletinDoc.refNo}</h3>
                <p className="muted">{t(lang, 'bulDesc')}</p>
                <div className="row">
                  <button className="btn primary" onClick={() => { void printLiveBulletin(); }}>{printBusy ? t(lang, 'syncing') : t(lang, 'printPdf')}</button>
                  <button className="btn" onClick={() => {
                    const csv = buildFullCsv(
                      { at: new Date().toLocaleString(), zones: zones.length, severe: counts.high + counts.critical, source: useLive ? `LIVE Open-Meteo (synced ${liveAt || 'just now'})` : 'SIMULATED demo bundle' },
                      bulletinDoc.rows,
                    );
                    downloadTextFile(`ner-risk-register-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
                  }}>{t(lang, 'auditCsv')}</button>
                </div>
              </div>
              <Bulletin doc={bulletinDoc} />
              <div className="card no-print"><h3>{t(lang, 'fieldMode')}</h3><p className="muted">{t(lang, 'fieldDesc')}</p><p>{t(lang, 'nearby')}: <b>{selected.zone.place}</b> — {selected.risk.score} ({levelName(lang, selected.risk.level)})</p><p className="muted">{t(lang, 'emergency')}</p><button className="btn primary" onClick={() => setTab('Community')}>{t(lang, 'reportInc')}</button></div>
            </div>
          )}

          {tab === 'Simulation' && <WhatIfPanel key={selectedId} selectedId={selectedId} onAlert={(lvl, msg) => pushAlert(selectedId, lvl, msg)} lang={lang} />}

          {tab === 'Community' && <CommunityForm reports={reports} setReports={setReports} lang={lang} />}

          {tab === 'Admin' && (
            <div className="card"><h3>{t(lang, 'authDash')}</h3>
              {reports.length === 0 && <p className="muted">{t(lang, 'noReports')}</p>}
              {reports.map(r => <div key={r.id} className="card" style={{ marginTop: 8 }}><b>{r.place}, {r.district}</b> <span className="badge">{statusLabel(r.status)}</span><p className="muted">{r.date} · {r.severity} · {t(lang, 'thRoads')}: {r.roadBlocked ? '✓' : '—'} · {r.description}</p>{r.aiNote && <p className="muted">{r.aiNote}</p>}<div className="row">{(['NEW', 'UNDER REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED'] as const).map(s => <button key={s} className="btn" onClick={() => setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: s } : x))}>{statusLabel(s)}</button>)}</div></div>)}
            </div>
          )}
        </div>
      </div>
      <div className="footer">{t(lang, 'footer')}</div>
    </>
  );
}
