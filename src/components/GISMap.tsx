import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { HISTORICAL_INCIDENTS } from '../data/historical';
import { levelRank } from '../lib/riskEngine';
import { haversineKm, nearestZone } from '../lib/geo';
import type { NerZone } from '../data/nerDistricts';

export interface MapZone {
  zone: NerZone;
  live: boolean;
  risk: { score: number; level: string; color: string; reasons: string[] };
  rain24: number;
}

type Base = 'streets' | 'topo' | 'satellite';

const BASES: Record<Base, { url: string; attr: string; label: string }> = {
  streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors', label: 'Streets' },
  topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors, SRTM | style: © OpenTopoMap (CC-BY-SA)', label: 'Topo' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Imagery © Esri & contributors', label: 'Satellite' },
};

function FitAll() {
  const map = useMap();
  useEffect(() => { map.fitBounds([[21.9, 88.0], [29.5, 97.5]]); }, [map]);
  return null;
}

function FlyToSelected({ lat, lon, focusTick }: { lat: number; lon: number; focusTick: number }) {
  const map = useMap();
  const coords = useRef({ lat, lon });
  coords.current = { lat, lon };
  const lastTick = useRef(0);
  useEffect(() => {
    if (focusTick === 0 || focusTick === lastTick.current) return;
    lastTick.current = focusTick;
    map.flyTo([coords.current.lat, coords.current.lon], 11, { duration: 1.4 });
  }, [map, focusTick]);
  return null;
}

function LocateControl({ zones, onFound }: { zones: { zone: NerZone }[]; onFound: (msg: string, id?: string) => void }) {
  const map = useMap();
  return (
    <button
      className="btn"
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 500 }}
      onClick={() => {
        if (!navigator.geolocation) { onFound('Geolocation not supported on this device'); return; }
        onFound('Locating…');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const hit = nearestZone(zones.map(z => z.zone), latitude, longitude);
            map.flyTo([latitude, longitude], 11, { duration: 1.4 });
            onFound(
              hit ? `You are ~${hit.km} km from ${hit.zone.place} (${hit.zone.district}). Risk shown for that zone.` : 'Location found.',
              hit?.zone.id,
            );
          },
          () => onFound('Location blocked — allow GPS permission and retry.'),
          { timeout: 12000 },
        );
      }}
    >📍 Locate Me</button>
  );
}

export default function GISMap({ zones, layers, setLayers, selectedId, focusTick, demoBoost, onSelect }: {
  zones: MapZone[];
  layers: { risk: boolean; rain: boolean; hist: boolean; infra: boolean };
  setLayers: (l: { risk: boolean; rain: boolean; hist: boolean; infra: boolean }) => void;
  selectedId: string;
  focusTick: number;
  demoBoost: number;
  onSelect: (id: string) => void;
}) {
  const [base, setBase] = useState<Base>('streets');
  const [locateMsg, setLocateMsg] = useState('');
  const selected = zones.find(z => z.zone.id === selectedId) ?? zones[0];
  void haversineKm; // (kept for future distance readouts)

  return (
    <div>
      <div className="row">
        {(['risk', 'rain', 'hist', 'infra'] as const).map(k => (
          <label key={k} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" style={{ width: 16 }} checked={layers[k]} onChange={e => setLayers({ ...layers, [k]: e.target.checked })} />
            {k === 'risk' ? 'risk zones' : k === 'rain' ? 'rainfall halos' : k === 'hist' ? 'historical' : 'infrastructure'}
          </label>
        ))}
        <label>Base map <select value={base} onChange={e => setBase(e.target.value as Base)} style={{ width: 'auto' }}>
          {(Object.keys(BASES) as Base[]).map(b => <option key={b} value={b}>{BASES[b].label}</option>)}
        </select></label>
      </div>
      {locateMsg && <p className="muted" role="status" style={{ margin: '6px 0 0' }}>{locateMsg}</p>}
      <div style={{ position: 'relative', marginTop: 10 }}>
      <MapContainer center={[26, 92.5]} zoom={6} style={{ marginTop: 0 }}>
        <FitAll />
        <FlyToSelected lat={selected.zone.lat} lon={selected.zone.lon} focusTick={focusTick} />
        <TileLayer url={BASES[base].url} attribution={BASES[base].attr} />
        <LocateControl zones={zones} onFound={(msg, id) => { setLocateMsg(msg); if (id) onSelect(id); }} />
        {layers.rain && zones.map(z => (
          <CircleMarker key={`rain-${z.zone.id}`} center={[z.zone.lat, z.zone.lon]} radius={4 + Math.min(30, z.rain24 / 6)} pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.18, dashArray: '4 4' }}>
            <Popup><b>Rainfall: {z.zone.place}</b><br />{Math.round(z.rain24)} mm / 24h{z.live ? ' (LIVE)' : ' (demo)'}</Popup>
          </CircleMarker>
        ))}
        {layers.risk && zones.map(z => (
          <CircleMarker key={z.zone.id} center={[z.zone.lat, z.zone.lon]} radius={(z.zone.id === selected.zone.id ? 12 : 8) + z.risk.score / 12} pathOptions={{ color: z.zone.id === selected.zone.id ? '#ffffff' : z.risk.color, fillColor: z.risk.color, fillOpacity: 0.55, weight: z.zone.id === selected.zone.id ? 3 : 1 }} eventHandlers={{ click: () => onSelect(z.zone.id) }}>
            <Popup><b>{z.zone.place}</b> ({z.zone.district})<br />Risk {z.risk.score} — {z.risk.level}<br />Rain 24h: {Math.round(z.rain24)} mm<br />{z.risk.reasons[0]}</Popup>
          </CircleMarker>
        ))}
        {layers.infra && zones.filter(z => levelRank(z.risk.level as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') >= 2).map(z => (
          <CircleMarker key={`infra-${z.zone.id}`} center={[z.zone.lat + 0.07, z.zone.lon + 0.07]} radius={5} pathOptions={{ color: '#e8eefc', fillColor: '#e8eefc', fillOpacity: 0.9 }}>
            <Popup><b>Exposed infra near {z.zone.place}</b><br />{z.zone.roads.join('; ')}<br />{z.zone.infrastructure.join('; ')}</Popup>
          </CircleMarker>
        ))}
        {layers.hist && HISTORICAL_INCIDENTS.map(h => (
          <CircleMarker key={h.id} center={[h.lat, h.lon]} radius={5} pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.8 }}>
            <Popup><b>Historical: {h.place}</b><br />{h.date} · {h.severity}<br />{h.trigger}<br /><i>{h.source}</i></Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      </div>
      <div className="legend"><span><span className="dot" style={{ background: '#22c55e' }} />Low</span><span><span className="dot" style={{ background: '#eab308' }} />Moderate</span><span><span className="dot" style={{ background: '#f97316' }} />High</span><span><span className="dot" style={{ background: '#ef4444' }} />Critical</span><span><span className="dot" style={{ background: '#38bdf8' }} />Rainfall</span><span><span className="dot" style={{ background: '#e8eefc' }} />Infra</span><span><span className="dot" style={{ background: '#a78bfa' }} />Historical</span></div>
      <p className="muted">Base: {BASES[base].label} · Topo/satellite help read ridges & valleys; risk math unchanged. {demoBoost > 0 ? 'Demo +80mm boost active.' : ''}</p>
    </div>
  );
}
