import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { NER_ZONES, HISTORICAL_AVG_RAINFALL_24 } from './data/nerDistricts';
import { HISTORICAL_INCIDENTS } from './data/historical';
import { assessZone, WARNING_META, levelRank, type RiskLevel } from './lib/riskEngine';
import { fetchAllLiveWeather, loadCachedWeather, type LiveWeather } from './lib/weather';
import { fetchForecast72h, forecastTotal, type HourPoint } from './lib/forecast';
import { schematicTransect } from './lib/geo';
import { LANGS, t, type Lang } from './lib/i18n';
import { useLocalAlerts, useLocalReports, makeId, trend24h, type CommunityReport } from './lib/store';
import GISMap from './components/GISMap';
import WhatIfPanel from './components/WhatIfPanel';
import CommunityForm from './components/CommunityForm';
import CorridorMonitor from './components/CorridorMonitor';

type Tab = 'Dashboard' | 'Risk Map' | 'Monitoring' | 'Predictions' | 'Alerts' | 'Incidents' | 'Infrastructure' | 'Reports' | 'Simulation' | 'Community' | 'Admin';

const TABS: Tab[] = ['Dashboard', 'Risk Map', 'Monitoring', 'Predictions', 'Alerts', 'Incidents', 'Infrastructure', 'Reports', 'Simulation', 'Community', 'Admin'];
const TAB_KEYS: Record<Tab, string> = { Dashboard: 'dashboard', 'Risk Map': 'riskmap', Monitoring: 'monitoring', Predictions: 'predictions', Alerts: 'alerts', Incidents: 'incidents', Infrastructure: 'infrastructure', Reports: 'reports', Simulation: 'simulation', Community: 'community', Admin: 'admin' };

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

export default function App() {
  const [tab, setTab] = useState<Tab>('Dashboard');
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
        if (Object.keys(d).length === 0) setLiveError('Live fetch failed — showing demo numbers.');
      })
      .catch(() => { if (!cancelled) setLiveError('No internet / API blocked — showing demo numbers.'); })
      .finally(() => { if (!cancelled) setLiveLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLive]);
  const { reports, setReports } = useLocalReports();
  const { alerts, setAlerts } = useLocalAlerts();

  // Merge: demo numbers are the base; live rain overwrites them when ON.
  const zones = useMemo(() => NER_ZONES.map(z => {
    const L = (useLive && live[z.id]) ? live[z.id] : null;
    const base = {
      ...z,
      rainfall24mm: L ? L.rain24mm : z.rainfall24mm,
      rainfall7dmm: L ? L.rain7dmm : z.rainfall7dmm,
      soilMoisturePct: L ? L.soilEstPct : z.soilMoisturePct,
    };
    return {
      zone: base,
      live: !!L, // did this row use live data?
      risk: assessZone(base, demoBoost ? { rainfall24mm: base.rainfall24mm + demoBoost, soilMoisturePct: Math.min(96, base.soilMoisturePct + demoBoost / 6) } : undefined),
    };
  }), [demoBoost, useLive, live]);

  const sorted = useMemo(() => [...zones].sort((a, b) => b.risk.score - a.risk.score), [zones]);
  const selected = zones.find(z => z.zone.id === selectedId) ?? sorted[0];
  const counts = useMemo(() => ({
    critical: zones.filter(z => z.risk.level === 'CRITICAL').length,
    high: zones.filter(z => z.risk.level === 'HIGH').length,
    warnings: alerts.filter(a => !a.acked).length,
    exposed: zones.reduce((s, z) => s + z.zone.populationExposed, 0),
  }), [zones, alerts]);

  const allLow = zones.length > 0 && zones.every(z => z.risk.level === 'LOW');
  const overall: RiskLevel = counts.critical > 0 ? 'CRITICAL' : counts.high > 0 ? 'HIGH' : allLow ? 'LOW' : 'MODERATE';
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
    if (!q) { setSearchMsg('Type a place — e.g. Shillong'); return; }
    if (scored.length === 0) { setSearchMsg(`No match for "${query.trim()}" — try a district like Aizawl or a road like NH-6`); return; }
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
    );
    setDemoBoost(80);
    pushAlert(top.zone.id, after.level, `SIMULATION: heavy rainfall +80mm → ${top.zone.place} re-scored ${after.score} (${after.level}). Map + warning updated.`);
    setTab('Risk Map');
  };

  const refreshLive = () => {
    setLiveLoading(true); setLiveError('');
    fetchAllLiveWeather(NER_ZONES.map(z => ({ id: z.id, lat: z.lat, lon: z.lon })))
      .then(d => {
        setLive(d); const f = Object.values(d)[0]; if (f) setLiveAt(f.updatedAt);
        if (Object.keys(d).length === 0) setLiveError('Live fetch failed — showing demo numbers.');
        else if (!useLive) setUseLive(true);
      })
      .catch(() => setLiveError('No internet / API blocked — showing demo numbers.'))
      .finally(() => setLiveLoading(false));
  };

  const trend = trend24h(selected.risk.score, demoBoost ? 8 : 0);
  const rainBars = sorted.slice(0, 8).map(z => ({ name: z.zone.place, mm: Math.round(z.zone.rainfall24mm + demoBoost) }));
  const [lang, setLang] = useState<Lang>('en');
  const levelOf = (zoneId: string) => zones.find(z => z.zone.id === zoneId)?.risk.level ?? 'LOW';
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
                  {s.zone.place} <span className="muted">· {s.zone.district}, {s.zone.state} · {s.risk.score} {s.risk.level}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {searchMsg && <span className="muted" role="status">{searchMsg}</span>}
        <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? 'LIVE RAIN (Open-Meteo)' : 'SIMULATION DATA'}</span>
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
      <div className="disclaimer">Risk estimates are <b>decision-support information only</b> and do not replace official DDMA/GSI field verification. {useLive ? <span>Rainfall is <b>LIVE from Open-Meteo</b> (free API, no key){liveAt && `, fetched ${liveAt}`}; soil moisture is <b>estimated from rain</b>, not a sensor.</span> : <span>Rainfall, soil-moisture and model outputs are <b>simulated demo data</b> — press <b>🌧 Use Live Rain</b> for real rain.</span>} {liveError && <span> ⚠ {liveError}</span>} Historical rows marked DEMO are synthetic placeholders.</div>

      <div className="layout">
        <nav className="nav" role="tablist" aria-label="Main sections">
          {TABS.map(tb => <button key={tb} role="tab" aria-selected={tab === tb} className={tab === tb ? 'active' : ''} onClick={() => setTab(tb)}>{t(lang, TAB_KEYS[tb])}</button>)}
          <div className="muted" style={{ padding: '10px 6px' }}>MONITOR → ANALYZE → PREDICT → WARN → RESPOND</div>
        </nav>

        <div className="main">
          {tab === 'Dashboard' && (
            <div className="grid">
              <div className="card">
                <h3>Current Regional Risk — <span className="riskpill" style={{ background: overall === 'CRITICAL' ? '#ef4444' : overall === 'HIGH' ? '#f97316' : overall === 'LOW' ? '#22c55e' : '#eab308', color: '#111' }}>{overall} · {WARNING_META[overall].code} (text + color)</span></h3>
                <p className="muted">Highest zone: <b>{sorted[0].zone.place}</b> — {sorted[0].risk.score}/100 ({sorted[0].risk.level}). Recomputed from {useLive ? 'LIVE rain + terrain' : 'simulated rainfall + terrain'}. Last updated: {useLive && liveAt ? liveAt : bootTime} · Status: <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? 'LIVE RAIN' : 'SIMULATED'}</span></p>
                <div className="grid g4">
                  <div className="card"><div className="muted">Areas monitored</div><div className="stat">{zones.length}</div></div>
                  <div className="card"><div className="muted">High + Critical zones</div><div className="stat">{counts.high + counts.critical}</div></div>
                  <div className="card"><div className="muted">Active warnings</div><div className="stat">{counts.warnings}</div></div>
                  <div className="card"><div className="muted">Population potentially exposed</div><div className="stat">{(counts.exposed / 1000).toFixed(0)}k</div></div>
                </div>
              </div>
              <div className="grid g2">
                <div className="card"><h3>Top risk zones (click to inspect)</h3>
                  <div className="tablewrap"><table className="table"><thead><tr><th>Place</th><th>Rain 24h</th><th>Score</th><th>Level</th></tr></thead><tbody>
                    {sorted.slice(0, 6).map(z => <tr key={z.zone.id}><td><button className="btn" onClick={() => goToZone(z.zone.id)}>{z.zone.place}</button><div className="muted">{z.zone.district}, {z.zone.state} {z.live ? '· 🟢live' : '· demo'}</div></td><td>{Math.round(z.zone.rainfall24mm + demoBoost)} mm</td><td>{z.risk.score}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{z.risk.level}</span></td></tr>)}
                  </tbody></table></div>
                </div>
                <div className="card"><h3>24h rainfall vs {HISTORICAL_AVG_RAINFALL_24}mm avg ({useLive ? 'LIVE, top 8' : 'simulated, top 8'})</h3>
                  {rainBars.length === 0 ? <p className="muted">No rainfall data.</p> : (
                  <ResponsiveContainer width="100%" height={260}><BarChart data={rainBars} margin={{ bottom: 40 }}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="name" tick={{ fill: '#93a4c4', fontSize: 11 }} interval="preserveStartEnd" tickFormatter={(v: string) => v.slice(0, 9)} angle={-20} height={60} /><YAxis tick={{ fill: '#93a4c4' }} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Bar dataKey="mm" fill="#38bdf8" /></BarChart></ResponsiveContainer>)}
                </div>
              </div>
              <div className="card"><h3>Judge demo storyline (MONITOR → RESPOND)</h3>
                <ol className="steps muted">
                  <li>Open <kbd>Risk Map</kbd>, select <kbd>Dima Hasao / Haflong</kbd> — note MODERATE–HIGH baseline.</li>
                  <li>Press <kbd>▶ Demo: Heavy Rain</kbd> — rainfall +80mm, soil moisture rises, AI re-scores.</li>
                  <li>Map marker turns ORANGE/RED; open <kbd>Alerts</kbd> — early warning generated with reason + action.</li>
                  <li>Open <kbd>Infrastructure</kbd> — roads/rail potentially exposed appear.</li>
                  <li>Open <kbd>Community</kbd> — submit a field report; verify it in <kbd>Admin</kbd>.</li>
                </ol>
              </div>
            </div>
          )}

          {tab === 'Risk Map' && (
            <div className="grid">
              <div className="card">
                <h3>{t(lang, 'riskmap')} — GIS <span className="badge sim">DEMO LAYERS</span></h3>
                <Suspense fallback={<p className="muted">Loading map…</p>}>
                  <GISMap
                    zones={zones.map(z => ({ zone: z.zone, live: z.live, risk: { score: z.risk.score, level: z.risk.level, color: z.risk.color, reasons: z.risk.reasons }, rain24: z.zone.rainfall24mm + demoBoost }))}
                    layers={layers} setLayers={setLayers} selectedId={selected.zone.id} focusTick={focusTick} demoBoost={demoBoost}
                    onSelect={(id) => { setSelectedId(id); }}
                  />
                </Suspense>
              </div>
              <div className="card">
                <h3>Location detail — {selected.zone.place}, {selected.zone.district}</h3>
                <p><span className="riskpill" style={{ background: selected.risk.color }}>{selected.risk.score}/100 · {selected.risk.level}</span> <span className="muted">Est. probability {selected.risk.probabilityPct}% · model prediction, not certainty</span></p>
                {selected.risk.factors.map(f => <div key={f.name} style={{ margin: '6px 0' }}><div className="row" style={{ justifyContent: 'space-between' }}><span>{f.name}</span><span className="muted">{f.detail} · {Math.round(f.value)}%</span></div><div className="factorbar"><div style={{ width: `${f.value}%`, background: selected.risk.color }} /></div></div>)}
                <h3>Why is this area at risk?</h3>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p className="muted">⛰ I-D check (Caine curve): <b style={{ color: selected.risk.id.exceeded ? '#ef4444' : '#22c55e' }}>{selected.risk.id.exceeded ? 'EXCEEDED' : 'OK'}</b> — {selected.risk.id.note}</p>
                <h3>Terrain transect (schematic, not surveyed)</h3>
                <ResponsiveContainer width="100%" height={140}><AreaChart data={transect} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="x" tick={false} /><YAxis tick={{ fill: '#93a4c4', fontSize: 11 }} domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Area type="monotone" dataKey="m" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} /></AreaChart></ResponsiveContainer>
                <p className="muted">Illustrative profile around {selected.zone.elevationM} m — shows why slope + elevation feed the model. Replace with SRTM/DEM cross-section for surveys.</p>
                <p><b>Recommended action:</b> {selected.risk.action}</p>
                <p className="muted">Elevation {selected.zone.elevationM} m · Slope {selected.zone.slopeDeg}° · Soil {selected.zone.soil} · {selected.zone.histCount5y} incidents/5y · Data status: {selected.live ? 'LIVE RAIN + estimated moisture' : 'SIMULATED'} · {useLive && liveAt ? `Rain fetched ${liveAt}` : `Source: demo bundle, ${bootTime}`}</p>
                <div className="row">
                  <button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, `Manual warning: ${selected.zone.place} scored ${selected.risk.score} (${selected.risk.level}). ${selected.risk.reasons[0]}. Action: ${selected.risk.action}`)}>Generate warning</button>
                  <button className="btn" onClick={() => setTab('Simulation')}>Open What-If simulator</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Monitoring' && (
            <div className="grid">
              <div className="card"><h3>Rainfall monitoring <span className={useLive ? 'badge live' : 'badge sim'}>{useLive ? 'LIVE FEED (Open-Meteo)' : 'SIMULATED FEED'}</span></h3>
                <div className="tablewrap"><table className="table"><thead><tr><th>Zone</th><th>24h</th><th>7d</th><th>Anomaly vs {HISTORICAL_AVG_RAINFALL_24}mm</th><th>Soil moist.</th></tr></thead><tbody>
                  {sorted.map(z => { const cur = Math.round(z.zone.rainfall24mm + demoBoost); const an = Math.round(((cur - HISTORICAL_AVG_RAINFALL_24) / HISTORICAL_AVG_RAINFALL_24) * 100); return <tr key={z.zone.id}><td>{z.zone.place}</td><td>{cur} mm</td><td>{Math.round(z.zone.rainfall7dmm + demoBoost * 2)} mm</td><td style={{ color: an > 50 ? '#ef4444' : an > 0 ? '#eab308' : '#22c55e' }}>{an > 0 ? `+${an}%` : `${an}%`}</td><td>{Math.min(96, Math.round(z.zone.soilMoisturePct + demoBoost / 6))}%</td></tr>; })}
                </tbody></table></div>
                <p className="muted">Source: {useLive ? 'Open-Meteo forecast API (free, no key)' : 'simulated bundle'} · Last updated {useLive && liveAt ? liveAt : bootTime} · Soil moisture {useLive ? 'estimated from weekly rain (not a sensor)' : 'simulated'} · Cache: 1 hour in browser · To upgrade: plug IMD AWS/ARG rain-gauge API here.</p>
              </div>
            </div>
          )}

          {tab === 'Predictions' && (
            <div className="grid g2">
              <div className="card"><h3>Next-24h risk trend — {selected.zone.place} <span className="badge sim">MODEL PREDICTION</span></h3>
                <ResponsiveContainer width="100%" height={280}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="t" tick={{ fill: '#93a4c4' }} /><YAxis tick={{ fill: '#93a4c4' }} domain={[0, 100]} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={3} dot /></LineChart></ResponsiveContainer>
                <p className="muted">Estimated trajectory if rainfall persists. Not a guaranteed occurrence.</p>
                <div className="row">{zones.slice(0, 6).map(z => <button key={z.zone.id} className="btn" onClick={() => setSelectedId(z.zone.id)}>{z.zone.place}</button>)}</div>
              </div>
              <div className="card"><h3>AI explanation panel</h3>
                <p>Prediction: <b>{selected.risk.score}% ({selected.risk.level})</b> · Confidence: heuristic ensemble (weighted logistic, demo weights)</p>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p className="muted">Inputs: rain 24h/7d, slope, elevation, soil moisture, land cover, river distance, 5y history. For hackathon: prioritize explainability + reliability over deep learning. Train RandomForest/XGBoost on GSI+IMD data when available — see <kbd>src/lib/riskEngine.ts</kbd>.</p>
                <h3>72h precipitation outlook — {selected.zone.place} <span className="badge live">LIVE FORECAST</span></h3>
                {fcLoading && <p className="muted">Loading forecast…</p>}
                {fcError && <p className="muted">{fcError}</p>}
                {!fcLoading && !fcError && fc.length > 0 && (
                  <><ResponsiveContainer width="100%" height={200}><BarChart data={fc}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="time" tick={{ fill: '#93a4c4', fontSize: 10 }} interval="preserveStartEnd" /><YAxis tick={{ fill: '#93a4c4' }} /><Tooltip contentStyle={{ background: '#0d1628', border: '1px solid #22345c', color: '#e8eefc' }} /><Bar dataKey="mm" fill="#38bdf8" /></BarChart></ResponsiveContainer>
                  <p className="muted">72h total ≈ <b>{forecastTotal(fc)} mm</b> (Open-Meteo, 3h blocks). If this lands on saturated soil, expect the risk score to climb — re-check Monitoring.</p></>
                )}
              </div>
            </div>
          )}

          {tab === 'Alerts' && (
            <div className="grid">
              <div className="card"><h3>Early warnings (GREEN→YELLOW→ORANGE→RED)</h3>
                <div className="row"><button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, `Auto rule: ${selected.zone.place} ${selected.risk.score} (${selected.risk.level}) exceeds threshold.`)}>Generate for {selected.zone.place}</button>
                {alerts.length > 0 && <button className="btn danger" onClick={() => { if (window.confirm(`Delete all ${alerts.length} alerts? This cannot be undone.`)) setAlerts([]); }}>🗑 Clear all ({alerts.length})</button>}</div>
                {alerts.length === 0 && <p className="muted">No alerts yet. Run the Heavy-Rain demo or generate one manually.</p>}
                {alerts.map(a => <div key={a.id} className="card alert" style={{ marginTop: 10 }}><b>[{a.level}] {a.zoneName}</b> <span className="muted">{a.time}</span><p>{a.message}</p><p className="muted">Channel: {a.channel} — clearly mock; wire SMS/email gateway for production.</p><div className="row"><button className="btn" onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, acked: !x.acked } : x))}>{a.acked ? 'Unack' : 'Acknowledge'}</button></div></div>)}
              </div>
            </div>
          )}

          {tab === 'Incidents' && (
            <div className="card"><h3>Historical landslide database <span className="badge sim">1 VERIFIED + DEMO ROWS</span></h3>
              <div className="tablewrap"><table className="table"><thead><tr><th>Date</th><th>Place</th><th>Trigger</th><th>Severity</th><th>Impact</th><th>Source</th></tr></thead><tbody>
                {HISTORICAL_INCIDENTS.map(h => <tr key={h.id}><td>{h.date}</td><td>{h.place}<div className="muted">{h.district}, {h.state} {h.demo && '(DEMO)'}</div></td><td>{h.trigger}</td><td>{h.severity}</td><td>{h.infraImpact}</td><td className="muted">{h.source}</td></tr>)}
              </tbody></table></div>
            </div>
          )}

          {tab === 'Infrastructure' && (
            <div className="grid">
              <CorridorMonitor levelOf={levelOf} />
              <div className="card"><h3>Critical infrastructure exposure <span className="badge sim">POTENTIALLY EXPOSED</span></h3>
              <div className="tablewrap"><table className="table"><thead><tr><th>Zone</th><th>Risk</th><th>Roads</th><th>Infra</th><th>Population</th></tr></thead><tbody>
                {sorted.filter(z => levelRank(z.risk.level) >= 2).map(z => <tr key={z.zone.id}><td>{z.zone.place}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{z.risk.level}</span></td><td>{z.zone.roads.join('; ')}</td><td>{z.zone.infrastructure.join('; ')}</td><td>{z.zone.populationExposed.toLocaleString()}</td></tr>)}
              </tbody></table></div>
              <p className="muted">Road risk: segments within ~300m of HIGH/CRITICAL zones flagged for increased monitoring. Do not claim damage unless field-verified.</p>
              </div>
            </div>
          )}

          {tab === 'Reports' && (
            <div className="grid g2">
              <div className="card"><h3>Regional risk report</h3>
                <p className="muted">Date {new Date().toLocaleDateString()} · {zones.length} zones · {counts.critical} critical · {counts.high} high · {alerts.length} alerts · {reports.length} community reports</p>
                <ul className="muted">{sorted.slice(0, 5).map(z => <li key={z.zone.id}>{z.zone.place} ({z.zone.district}) — {z.risk.score} {z.risk.level}: {z.risk.reasons[0]}</li>)}</ul>
                <div className="row">
                  <button className="btn" onClick={() => {
                    const rows = [['place', 'district', 'state', 'rain24', 'score', 'level'], ...sorted.map(z => [z.zone.place, z.zone.district, z.zone.state, String(Math.round(z.zone.rainfall24mm + demoBoost)), String(z.risk.score), z.risk.level])];
                    exportRiskCsv(rows, 'ner-risk-report.csv');
                  }}>Export CSV</button>
                  <button className="btn" onClick={() => window.print()}>Print / PDF</button>
                </div>
              </div>
              <div className="card"><h3>Field mode (mobile-first)</h3><p className="muted">Current location → nearby risk → one-tap report → emergency contacts. Drafts queue offline in localStorage; sync when online.</p><p>Nearby: <b>{selected.zone.place}</b> — {selected.risk.score} ({selected.risk.level})</p><p className="muted">Emergency: DDMA control room (add number) · NDRF 1078 · Police 112</p><button className="btn primary" onClick={() => setTab('Community')}>Report incident</button></div>
            </div>
          )}

          {tab === 'Simulation' && <WhatIfPanel key={selectedId} selectedId={selectedId} onAlert={(lvl, msg) => pushAlert(selectedId, lvl, msg)} />}

          {tab === 'Community' && <CommunityForm reports={reports} setReports={setReports} />}

          {tab === 'Admin' && (
            <div className="card"><h3>Authority dashboard — verify reports & alerts</h3>
              {reports.length === 0 && <p className="muted">No community reports yet.</p>}
              {reports.map(r => <div key={r.id} className="card" style={{ marginTop: 8 }}><b>{r.place}, {r.district}</b> <span className="badge">{r.status}</span><p className="muted">{r.date} · {r.severity} · Road blocked: {r.roadBlocked ? 'yes' : 'no'} · {r.description}</p>{r.aiNote && <p className="muted">{r.aiNote}</p>}<div className="row">{(['NEW', 'UNDER REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED'] as const).map(s => <button key={s} className="btn" onClick={() => setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: s } : x))}>{s}</button>)}</div></div>)}
            </div>
          )}
        </div>
      </div>
      <div className="footer">NER LandslideGuard · SIH26001 prototype · Data: OpenStreetMap tiles, simulated IMD/GSI stand-ins · Model: weighted-logistic demo in <kbd>src/lib/riskEngine.ts</kbd> · Auth/DB: localStorage mock (add backend + RBAC for production) · “Potentially exposed”, never “damaged”, unless verified.</div>
    </>
  );
}
