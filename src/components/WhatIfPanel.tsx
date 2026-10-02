import { useState } from 'react';
import { NER_ZONES } from '../data/nerDistricts';
import { assessZone, type RiskLevel } from '../lib/riskEngine';

export default function WhatIfPanel({ selectedId, onAlert }: { selectedId: string; onAlert: (l: RiskLevel, m: string) => void }) {
  const z = NER_ZONES.find(v => v.id === selectedId) ?? NER_ZONES[0]; // safe fallback, never crash
  const [rain, setRain] = useState(z.rainfall24mm);
  const [slope, setSlope] = useState(z.slopeDeg);
  const [moist, setMoist] = useState(z.soilMoisturePct);
  const [hist, setHist] = useState<'Low' | 'High'>('High');
  // key={selectedId} on parent remounts this panel per zone, so sliders never go stale.
  const fake = { ...z, histCount5y: hist === 'High' ? 15 : 3 };
  const r = assessZone(fake, { rainfall24mm: rain, slopeDeg: slope, soilMoisturePct: moist });
  return (
    <div className="grid g2">
      <div className="card"><h3>Risk simulator (What-If) — {z.place}</h3>
        <label htmlFor="sim-rain">Rainfall 24h: {rain} mm</label><input id="sim-rain" type="range" min={0} max={300} value={rain} onChange={e => setRain(+e.target.value)} />
        <label htmlFor="sim-slope">Slope: {slope}°</label><input id="sim-slope" type="range" min={10} max={45} value={slope} onChange={e => setSlope(+e.target.value)} />
        <label htmlFor="sim-moist">Soil moisture: {moist}%</label><input id="sim-moist" type="range" min={20} max={98} value={moist} onChange={e => setMoist(+e.target.value)} />
        <label htmlFor="sim-hist">Historical risk</label><select id="sim-hist" value={hist} onChange={e => setHist(e.target.value as 'Low' | 'High')}><option>Low</option><option>High</option></select>
        <p className="muted">I-D check: {r.id.note}</p>
      </div>
      <div className="card"><h3>Result: <span className="riskpill" style={{ background: r.color }}>{r.score}/100 · {r.level}</span></h3>
        <ul className="muted">{r.reasons.map(x => <li key={x}>{x}</li>)}</ul>
        <p><b>Action:</b> {r.action}</p>
        <button className="btn warn" onClick={() => onAlert(r.level, `What-If sim @ ${z.place}: rain ${rain}mm, slope ${slope}°, moisture ${moist}% → ${r.score} (${r.level}).`)}>Push as warning</button>
      </div>
    </div>
  );
}
