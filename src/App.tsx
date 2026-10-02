import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { NER_ZONES, HISTORICAL_AVG_RAINFALL_24 } from './data/nerDistricts';
import { HISTORICAL_INCIDENTS } from './data/historical';
import { assessZone, WARNING_META, levelRank, type RiskLevel } from './lib/riskEngine';
import { useLocalAlerts, useLocalReports, photoPrelimAssessment, trend24h, type CommunityReport } from './lib/store';

type Tab = 'Dashboard' | 'Risk Map' | 'Monitoring' | 'Predictions' | 'Alerts' | 'Incidents' | 'Infrastructure' | 'Reports' | 'Simulation' | 'Community' | 'Admin';

const TABS: Tab[] = ['Dashboard', 'Risk Map', 'Monitoring', 'Predictions', 'Alerts', 'Incidents', 'Infrastructure', 'Reports', 'Simulation', 'Community', 'Admin'];

function FitAll() {
  const map = useMap();
  map.fitBounds([[21.9, 88.0], [29.5, 97.5]]);
  return null;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('shillong-ekh');
  const [demoBoost, setDemoBoost] = useState(0); // mm added by demo simulation
  const [layers, setLayers] = useState({ risk: true, rain: true, hist: true, infra: false });
  const { reports, setReports } = useLocalReports();
  const { alerts, setAlerts } = useLocalAlerts();

  const zones = useMemo(() => NER_ZONES.map(z => ({
    zone: z,
    risk: assessZone(z, demoBoost ? { rainfall24mm: z.rainfall24mm + demoBoost, soilMoisturePct: Math.min(96, z.soilMoisturePct + demoBoost / 6) } : undefined),
  })), [demoBoost]);

  const sorted = useMemo(() => [...zones].sort((a, b) => b.risk.score - a.risk.score), [zones]);
  const selected = zones.find(z => z.zone.id === selectedId) ?? sorted[0];
  const counts = useMemo(() => ({
    critical: zones.filter(z => z.risk.level === 'CRITICAL').length,
    high: zones.filter(z => z.risk.level === 'HIGH').length,
    warnings: alerts.filter(a => !a.acked).length,
    exposed: zones.reduce((s, z) => s + z.zone.populationExposed, 0),
  }), [zones, alerts]);

  const overall: RiskLevel = counts.critical > 0 ? 'CRITICAL' : counts.high >= 3 ? 'HIGH' : counts.high >= 1 ? 'HIGH' : 'MODERATE';
  const filtered = query ? zones.filter(z => `${z.zone.place} ${z.zone.district} ${z.zone.state}`.toLowerCase().includes(query.toLowerCase())) : zones;

  const pushAlert = (zoneId: string, level: RiskLevel, message: string) => {
    const z = NER_ZONES.find(v => v.id === zoneId);
    setAlerts(prev => [{ id: `a-${Date.now()}`, time: new Date().toLocaleString(), zoneId, zoneName: z ? `${z.place}, ${z.district}` : zoneId, level, message, channel: 'Dashboard + Mock SMS/Email (SIMULATION)', acked: false }, ...prev]);
  };

  const runHeavyRainSim = () => {
    setDemoBoost(80);
    const top = sorted[0];
    pushAlert(top.zone.id, 'HIGH', `SIMULATION: heavy rainfall +80mm → ${top.zone.place} re-scored ${top.risk.score} (${top.risk.level}). Map + warning updated.`);
    setTab('Risk Map');
  };

  const trend = trend24h(selected.risk.score, demoBoost ? 8 : 0);
  const rainBars = sorted.slice(0, 8).map(z => ({ name: z.zone.place, mm: Math.round(z.zone.rainfall24mm + demoBoost) }));

  return (
    <>
      <div className="topbar">
        <div className="brand">⛰️ NER LandslideGuard<small>SIH26001 · MDoNER · DISASTER MGMT · DEMO/SIMULATION MODE</small></div>
        <div className="search">
          <input placeholder="Search state / district / village / road — e.g. Shillong" value={query} onChange={e => setQuery(e.target.value)} />
          <button className="btn" onClick={() => { const f = filtered[0]; if (f) { setSelectedId(f.zone.id); setTab('Risk Map'); } }}>Go</button>
        </div>
        <span className="badge sim">SIMULATION DATA</span>
        <button className="btn" onClick={() => setTab('Alerts')}>🔔 Alerts ({counts.warnings})</button>
        <button className="btn primary" onClick={runHeavyRainSim}>▶ Demo: Heavy Rain</button>
        {demoBoost > 0 && <button className="btn" onClick={() => setDemoBoost(0)}>Reset sim</button>}
      </div>
      <div className="disclaimer">Risk estimates are <b>decision-support information only</b> and do not replace official DDMA/GSI field verification. Rainfall, soil-moisture and model outputs on this page are <b>simulated demo data</b> unless a live provider is connected. Historical rows marked DEMO are synthetic placeholders.</div>

      <div className="layout">
        <nav className="nav">
          {TABS.map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
          <div className="muted" style={{ padding: '10px 6px' }}>MONITOR → ANALYZE → PREDICT → WARN → RESPOND</div>
        </nav>

        <div className="main">
          {tab === 'Dashboard' && (
            <div className="grid">
              <div className="card">
                <h3>Current Regional Risk — <span className="riskpill" style={{ background: overall === 'CRITICAL' ? '#ef4444' : overall === 'HIGH' ? '#f97316' : '#eab308', color: '#111' }}>{overall} · {WARNING_META[overall].code}</span></h3>
                <p className="muted">Highest zone: <b>{sorted[0].zone.place}</b> — {sorted[0].risk.score}/100 ({sorted[0].risk.level}). Recomputed from simulated rainfall + terrain. Last updated: {new Date().toLocaleString()} · Status: <span className="badge sim">SIMULATED</span></p>
                <div className="grid g4">
                  <div className="card"><div className="muted">Areas monitored</div><div className="stat">{zones.length}</div></div>
                  <div className="card"><div className="muted">High + Critical zones</div><div className="stat">{counts.high + counts.critical}</div></div>
                  <div className="card"><div className="muted">Active warnings</div><div className="stat">{counts.warnings}</div></div>
                  <div className="card"><div className="muted">Population potentially exposed</div><div className="stat">{(counts.exposed / 1000).toFixed(0)}k</div></div>
                </div>
              </div>
              <div className="grid g2">
                <div className="card"><h3>Top risk zones (click to inspect)</h3>
                  <table className="table"><thead><tr><th>Place</th><th>Rain 24h</th><th>Score</th><th>Level</th></tr></thead><tbody>
                    {sorted.slice(0, 6).map(z => <tr key={z.zone.id}><td><button className="btn" onClick={() => { setSelectedId(z.zone.id); setTab('Risk Map'); }}>{z.zone.place}</button><div className="muted">{z.zone.district}, {z.zone.state}</div></td><td>{Math.round(z.zone.rainfall24mm + demoBoost)} mm</td><td>{z.risk.score}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{z.risk.level}</span></td></tr>)}
                  </tbody></table>
                </div>
                <div className="card"><h3>24h rainfall vs {HISTORICAL_AVG_RAINFALL_24}mm avg (simulated, top 8)</h3>
                  <ResponsiveContainer width="100%" height={260}><BarChart data={rainBars}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="name" tick={{ fill: '#93a4c4', fontSize: 11 }} interval={0} angle={-20} height={60} /><YAxis tick={{ fill: '#93a4c4' }} /><Tooltip /><Bar dataKey="mm" fill="#38bdf8" /></BarChart></ResponsiveContainer>
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
                <h3>Interactive GIS map <span className="badge sim">DEMO LAYERS</span></h3>
                <div className="row">
                  {(['risk', 'rain', 'hist', 'infra'] as const).map(k => <label key={k} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><input type="checkbox" style={{ width: 16 }} checked={layers[k]} onChange={e => setLayers({ ...layers, [k]: e.target.checked })} />{k}</label>)}
                </div>
                <MapContainer center={[26, 92.5]} zoom={6} style={{ marginTop: 10 }}>
                  <FitAll />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
                  {layers.risk && zones.map(z => (
                    <CircleMarker key={z.zone.id} center={[z.zone.lat, z.zone.lon]} radius={8 + z.risk.score / 12} pathOptions={{ color: z.risk.color, fillColor: z.risk.color, fillOpacity: 0.55 }} eventHandlers={{ click: () => setSelectedId(z.zone.id) }}>
                      <Popup><b>{z.zone.place}</b> ({z.zone.district})<br />Risk {z.risk.score} — {z.risk.level}<br />Rain 24h: {Math.round(z.zone.rainfall24mm + demoBoost)} mm<br />{z.risk.reasons[0]}</Popup>
                    </CircleMarker>
                  ))}
                  {layers.hist && HISTORICAL_INCIDENTS.map(h => (
                    <CircleMarker key={h.id} center={[h.lat, h.lon]} radius={5} pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.8 }}>
                      <Popup><b>Historical: {h.place}</b><br />{h.date} · {h.severity}<br />{h.trigger}<br /><i>{h.source}</i></Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
                <div className="legend"><span><span className="dot" style={{ background: '#22c55e' }} />Low</span><span><span className="dot" style={{ background: '#eab308' }} />Moderate</span><span><span className="dot" style={{ background: '#f97316' }} />High</span><span><span className="dot" style={{ background: '#ef4444' }} />Critical</span><span><span className="dot" style={{ background: '#a78bfa' }} />Historical incident</span></div>
              </div>
              <div className="card">
                <h3>Location detail — {selected.zone.place}, {selected.zone.district}</h3>
                <p><span className="riskpill" style={{ background: selected.risk.color }}>{selected.risk.score}/100 · {selected.risk.level}</span> <span className="muted">Est. probability {selected.risk.probabilityPct}% · model prediction, not certainty</span></p>
                {selected.risk.factors.map(f => <div key={f.name} style={{ margin: '6px 0' }}><div className="row" style={{ justifyContent: 'space-between' }}><span>{f.name}</span><span className="muted">{f.detail} · {Math.round(f.value)}%</span></div><div className="factorbar"><div style={{ width: `${f.value}%`, background: selected.risk.color }} /></div></div>)}
                <h3>Why is this area at risk?</h3>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p><b>Recommended action:</b> {selected.risk.action}</p>
                <p className="muted">Elevation {selected.zone.elevationM} m · Slope {selected.zone.slopeDeg}° · Soil {selected.zone.soil} · {selected.zone.histCount5y} incidents/5y · Data status: SIMULATED · Source: demo bundle, {new Date().toLocaleTimeString()}</p>
                <div className="row">
                  <button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, `Manual warning: ${selected.zone.place} scored ${selected.risk.score} (${selected.risk.level}). ${selected.risk.reasons[0]}. Action: ${selected.risk.action}`)}>Generate warning</button>
                  <button className="btn" onClick={() => setTab('Simulation')}>Open What-If simulator</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Monitoring' && (
            <div className="grid">
              <div className="card"><h3>Rainfall monitoring <span className="badge sim">SIMULATED FEED</span></h3>
                <table className="table"><thead><tr><th>Zone</th><th>24h</th><th>7d</th><th>Anomaly vs {HISTORICAL_AVG_RAINFALL_24}mm</th><th>Soil moist.</th></tr></thead><tbody>
                  {sorted.map(z => { const cur = Math.round(z.zone.rainfall24mm + demoBoost); const an = Math.round(((cur - HISTORICAL_AVG_RAINFALL_24) / HISTORICAL_AVG_RAINFALL_24) * 100); return <tr key={z.zone.id}><td>{z.zone.place}</td><td>{cur} mm</td><td>{Math.round(z.zone.rainfall7dmm + demoBoost * 2)} mm</td><td style={{ color: an > 50 ? '#ef4444' : an > 0 ? '#eab308' : '#22c55e' }}>{an > 0 ? `+${an}%` : `${an}%`}</td><td>{Math.min(96, Math.round(z.zone.soilMoisturePct + demoBoost / 6))}%</td></tr>; })}
                </tbody></table>
                <p className="muted">Source: simulated bundle · Last updated {new Date().toLocaleString()} · Update frequency: on demo trigger · To go live: plug IMD AWS/ARG or state rain-gauge API here.</p>
              </div>
            </div>
          )}

          {tab === 'Predictions' && (
            <div className="grid g2">
              <div className="card"><h3>Next-24h risk trend — {selected.zone.place} <span className="badge sim">MODEL PREDICTION</span></h3>
                <ResponsiveContainer width="100%" height={280}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#22345c" /><XAxis dataKey="t" tick={{ fill: '#93a4c4' }} /><YAxis tick={{ fill: '#93a4c4' }} domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={3} dot /></LineChart></ResponsiveContainer>
                <p className="muted">Estimated trajectory if rainfall persists. Not a guaranteed occurrence.</p>
                <div className="row">{zones.slice(0, 6).map(z => <button key={z.zone.id} className="btn" onClick={() => setSelectedId(z.zone.id)}>{z.zone.place}</button>)}</div>
              </div>
              <div className="card"><h3>AI explanation panel</h3>
                <p>Prediction: <b>{selected.risk.score}% ({selected.risk.level})</b> · Confidence: heuristic ensemble (weighted logistic, demo weights)</p>
                <ul className="muted">{selected.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                <p className="muted">Inputs: rain 24h/7d, slope, elevation, soil moisture, land cover, river distance, 5y history. For hackathon: prioritize explainability + reliability over deep learning. Train RandomForest/XGBoost on GSI+IMD data when available — see <kbd>src/lib/riskEngine.ts</kbd>.</p>
              </div>
            </div>
          )}

          {tab === 'Alerts' && (
            <div className="grid">
              <div className="card"><h3>Early warnings (GREEN→YELLOW→ORANGE→RED)</h3>
                <div className="row"><button className="btn warn" onClick={() => pushAlert(selected.zone.id, selected.risk.level, `Auto rule: ${selected.zone.place} ${selected.risk.score} (${selected.risk.level}) exceeds threshold.`)}>Generate for {selected.zone.place}</button></div>
                {alerts.length === 0 && <p className="muted">No alerts yet. Run the Heavy-Rain demo or generate one manually.</p>}
                {alerts.map(a => <div key={a.id} className="card alert" style={{ marginTop: 10 }}><b>[{a.level}] {a.zoneName}</b> <span className="muted">{a.time}</span><p>{a.message}</p><p className="muted">Channel: {a.channel} — clearly mock; wire SMS/email gateway for production.</p><div className="row"><button className="btn" onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, acked: !x.acked } : x))}>{a.acked ? 'Unack' : 'Acknowledge'}</button></div></div>)}
              </div>
            </div>
          )}

          {tab === 'Incidents' && (
            <div className="card"><h3>Historical landslide database <span className="badge sim">1 VERIFIED + DEMO ROWS</span></h3>
              <table className="table"><thead><tr><th>Date</th><th>Place</th><th>Trigger</th><th>Severity</th><th>Impact</th><th>Source</th></tr></thead><tbody>
                {HISTORICAL_INCIDENTS.map(h => <tr key={h.id}><td>{h.date}</td><td>{h.place}<div className="muted">{h.district}, {h.state} {h.demo && '(DEMO)'}</div></td><td>{h.trigger}</td><td>{h.severity}</td><td>{h.infraImpact}</td><td className="muted">{h.source}</td></tr>)}
              </tbody></table>
            </div>
          )}

          {tab === 'Infrastructure' && (
            <div className="card"><h3>Critical infrastructure exposure <span className="badge sim">POTENTIALLY EXPOSED</span></h3>
              <table className="table"><thead><tr><th>Zone</th><th>Risk</th><th>Roads</th><th>Infra</th><th>Population</th></tr></thead><tbody>
                {sorted.filter(z => levelRank(z.risk.level) >= 2).map(z => <tr key={z.zone.id}><td>{z.zone.place}</td><td><span className="riskpill" style={{ background: z.risk.color }}>{z.risk.level}</span></td><td>{z.zone.roads.join('; ')}</td><td>{z.zone.infrastructure.join('; ')}</td><td>{z.zone.populationExposed.toLocaleString()}</td></tr>)}
              </tbody></table>
              <p className="muted">Road risk: segments within ~300m of HIGH/CRITICAL zones flagged for increased monitoring. Do not claim damage unless field-verified.</p>
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
                    const csv = rows.map(r => r.join(',')).join('\n');
                    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'ner-risk-report.csv'; a.click();
                  }}>Export CSV</button>
                  <button className="btn" onClick={() => window.print()}>Print / PDF</button>
                </div>
              </div>
              <div className="card"><h3>Field mode (mobile-first)</h3><p className="muted">Current location → nearby risk → one-tap report → emergency contacts. Drafts queue offline in localStorage; sync when online.</p><p>Nearby: <b>{selected.zone.place}</b> — {selected.risk.score} ({selected.risk.level})</p><p className="muted">Emergency: DDMA control room (add number) · NDRF 1078 · Police 112</p><button className="btn primary" onClick={() => setTab('Community')}>Report incident</button></div>
            </div>
          )}

          {tab === 'Simulation' && <SimPanel selectedId={selectedId} onAlert={(lvl, msg) => pushAlert(selectedId, lvl, msg)} />}

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

function SimPanel({ selectedId, onAlert }: { selectedId: string; onAlert: (l: RiskLevel, m: string) => void }) {
  const z = NER_ZONES.find(v => v.id === selectedId)!;
  const [rain, setRain] = useState(z.rainfall24mm);
  const [slope, setSlope] = useState(z.slopeDeg);
  const [moist, setMoist] = useState(z.soilMoisturePct);
  const [hist, setHist] = useState<'Low' | 'High'>('High');
  const fake = { ...z, histCount5y: hist === 'High' ? 15 : 3 };
  const r = assessZone(fake, { rainfall24mm: rain, slopeDeg: slope, soilMoisturePct: moist });
  return (
    <div className="grid g2">
      <div className="card"><h3>Risk simulator (What-If) — {z.place}</h3>
        <label>Rainfall 24h: {rain} mm</label><input type="range" min={0} max={300} value={rain} onChange={e => setRain(+e.target.value)} />
        <label>Slope: {slope}°</label><input type="range" min={10} max={45} value={slope} onChange={e => setSlope(+e.target.value)} />
        <label>Soil moisture: {moist}%</label><input type="range" min={20} max={98} value={moist} onChange={e => setMoist(+e.target.value)} />
        <label>Historical risk</label><select value={hist} onChange={e => setHist(e.target.value as 'Low' | 'High')}><option>Low</option><option>High</option></select>
      </div>
      <div className="card"><h3>Result: <span className="riskpill" style={{ background: r.color }}>{r.score}/100 · {r.level}</span></h3>
        <ul className="muted">{r.reasons.map(x => <li key={x}>{x}</li>)}</ul>
        <p><b>Action:</b> {r.action}</p>
        <button className="btn warn" onClick={() => onAlert(r.level, `What-If sim @ ${z.place}: rain ${rain}mm, slope ${slope}°, moisture ${moist}% → ${r.score} (${r.level}).`)}>Push as warning</button>
      </div>
    </div>
  );
}

function CommunityForm({ reports, setReports }: { reports: CommunityReport[]; setReports: (fn: (p: CommunityReport[]) => CommunityReport[]) => void }) {
  const [form, setForm] = useState({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' });
  const [aiNote, setAiNote] = useState('');
  return (
    <div className="grid g2">
      <div className="card"><h3>Report landslide (field / citizen)</h3>
        <label>Place</label><input value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} placeholder="e.g. Mawiongrim" />
        <label>District</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. East Khasi Hills" />
        <label>State</label><select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>{['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map(s => <option key={s}>{s}</option>)}</select>
        <label>Severity</label><select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}><option>Minor</option><option>Moderate</option><option>Major</option><option>Catastrophic</option></select>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 16 }} checked={form.roadBlocked} onChange={e => setForm({ ...form, roadBlocked: e.target.checked })} /> Road blocked?</label>
        <label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label>Photo (optional — AI-assisted preliminary note only)</label><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setAiNote(photoPrelimAssessment(f)); }} />
        {aiNote && <p className="muted">{aiNote}</p>}
        <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={() => {
          if (!form.place || !form.district) { alert('Add place + district'); return; }
          setReports(prev => [{ id: `r-${Date.now()}`, ...form, date: new Date().toLocaleString(), status: 'NEW', aiNote }, ...prev]);
          setForm({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' }); setAiNote('');
        }}>Submit (saved locally, status NEW)</button></div>
        <p className="muted">Offline-friendly: drafts persist in this browser; queue + sync when online.</p>
      </div>
      <div className="card"><h3>Submitted ({reports.length})</h3>{reports.map(r => <div key={r.id} className="card" style={{ marginTop: 8 }}><b>{r.place}</b> <span className="badge">{r.status}</span><p className="muted">{r.district}, {r.state} · {r.severity}</p></div>)}</div>
    </div>
  );
}
