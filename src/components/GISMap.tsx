import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { HISTORICAL_INCIDENTS } from '../data/historical';
import { CORRIDORS } from '../data/corridors';
import { levelRank } from '../lib/riskEngine';
import { nearestZone } from '../lib/geo';
import { t, levelName, type Lang } from '../lib/i18n';
import type { NerZone } from '../data/nerDistricts';

export interface MapZone {
  zone: NerZone;
  live: boolean;
  risk: { score: number; level: string; color: string; reasons: string[] };
  rain24: number;
}

type Base = 'dark' | 'streets' | 'topo' | 'satellite';
type Filter = 'all' | 'crit' | 'corr';

export default function GISMap({ zones, layers, setLayers, selectedId, focusTick, demoBoost, onSelect, lang, useLive, onToggleLive }: {
  zones: MapZone[];
  layers: { risk: boolean; rain: boolean; hist: boolean; infra: boolean };
  setLayers: (l: { risk: boolean; rain: boolean; hist: boolean; infra: boolean }) => void;
  selectedId: string;
  focusTick: number;
  demoBoost: number;
  onSelect: (id: string) => void;
  lang: Lang;
  useLive: boolean;
  onToggleLive: () => void;
}) {
  // Dark base: Esri Canvas Dark Gray (keyless). If the user adds a free
  // CARTO key as VITE_CARTO_KEY, CARTO Dark Matter is used instead.
  const cartoKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CARTO_KEY;
  const BASES: Record<Base, { url: string; attr: string; label: string }> = {
    dark: cartoKey
      ? { url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`, attr: '© OpenStreetMap contributors © CARTO', label: 'Dark' }
      : { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', attr: '© OpenStreetMap contributors, Esri Dark Gray', label: 'Dark' },
    streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors', label: t(lang, 'streets') },
    topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors, SRTM | style: © OpenTopoMap (CC-BY-SA)', label: t(lang, 'topo') },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Imagery © Esri & contributors', label: t(lang, 'satellite') },
  };
  const [base, setBase] = useState<Base>('streets');
  const [filter, setFilter] = useState<Filter>('all');
  const [locateMsg, setLocateMsg] = useState('');
  const selected = zones.find(z => z.zone.id === selectedId) ?? zones[0];
  const corrIds = useMemo(() => new Set(CORRIDORS.flatMap(c => c.zoneIds)), []);
  const visible = zones.filter(z =>
    filter === 'crit' ? (z.risk.level === 'HIGH' || z.risk.level === 'CRITICAL')
    : filter === 'corr' ? corrIds.has(z.zone.id) : true);

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        {([['all', 'filterAll'], ['crit', 'filterCrit'], ['corr', 'filterCorr']] as const).map(([v, k]) => (
          <button key={v} className={filter === v ? 'chip active' : 'chip'} onClick={() => setFilter(v)}>{t(lang, k)}</button>
        ))}
        <button className={useLive ? 'chip active' : 'chip'} onClick={onToggleLive}>{t(lang, 'filterLive')}</button>
      </div>
      <div className="row">
        {(['risk', 'rain', 'hist', 'infra'] as const).map(k => (
          <label key={k} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" style={{ width: 16 }} checked={layers[k]} onChange={e => setLayers({ ...layers, [k]: e.target.checked })} />
            {k === 'risk' ? t(lang, 'riskZones') : k === 'rain' ? t(lang, 'rainHalos') : k === 'hist' ? t(lang, 'historical') : t(lang, 'infraLyr')}
          </label>
        ))}
      </div>
      {locateMsg && <p className="muted" role="status" style={{ margin: '6px 0 0' }}>{locateMsg}</p>}
      <div style={{ position: 'relative', marginTop: 10 }}>
      <MapContainer center={[26, 92.5]} zoom={6} style={{ marginTop: 0 }}>
        <FitAll />
        <FlyToSelected lat={selected.zone.lat} lon={selected.zone.lon} focusTick={focusTick} />
        <TileLayer url={BASES[base].url} attribution={BASES[base].attr} />
        <LocateControl zones={zones} lang={lang} onFound={(msg, id) => { setLocateMsg(msg); if (id) onSelect(id); }} />
        {/* target-lock reticle on the selected zone */}
        <CircleMarker center={[selected.zone.lat, selected.zone.lon]} radius={22 + selected.risk.score / 12} pathOptions={{ className: 'reticle', color: '#fef08a', weight: 2, dashArray: '8 6', fillOpacity: 0, interactive: false }} />
        {layers.rain && visible.map(z => (
          <CircleMarker key={`rain-${z.zone.id}`} center={[z.zone.lat, z.zone.lon]} radius={4 + Math.min(30, z.rain24 / 6)} pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.18, dashArray: '4 4' }}>
            <Popup><b>{t(lang, 'thRain')}: {z.zone.place}</b><br />{Math.round(z.rain24)} mm / 24h{z.live ? ' (LIVE)' : ' (demo)'}</Popup>
          </CircleMarker>
        ))}
        {layers.risk && visible.map(z => (
          <CircleMarker key={z.zone.id} center={[z.zone.lat, z.zone.lon]} radius={(z.zone.id === selected.zone.id ? 12 : 8) + z.risk.score / 12} pathOptions={{ className: z.risk.level === 'CRITICAL' ? 'pulse-crit' : z.risk.level === 'HIGH' ? 'pulse-high' : undefined, color: z.zone.id === selected.zone.id ? '#ffffff' : z.risk.color, fillColor: z.risk.color, fillOpacity: 0.55, weight: z.zone.id === selected.zone.id ? 3 : 1 }} eventHandlers={{ click: () => onSelect(z.zone.id) }}>
            <Popup><b>{z.zone.place}</b> ({z.zone.district})<br />{t(lang, 'thRisk')} {z.risk.score} — {levelName(lang, z.risk.level)}<br />{t(lang, 'thRain')}: {Math.round(z.rain24)} mm<br />{z.risk.reasons[0]}</Popup>
          </CircleMarker>
        ))}
        {layers.infra && zones.filter(z => levelRank(z.risk.level as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') >= 2).map(z => (
          <CircleMarker key={`infra-${z.zone.id}`} center={[z.zone.lat + 0.07, z.zone.lon + 0.07]} radius={5} pathOptions={{ color: '#e8eefc', fillColor: '#e8eefc', fillOpacity: 0.9 }}>
            <Popup><b>{z.zone.place}</b><br />{z.zone.roads.join('; ')}<br />{z.zone.infrastructure.join('; ')}</Popup>
          </CircleMarker>
        ))}
        {layers.hist && HISTORICAL_INCIDENTS.map(h => (
          <CircleMarker key={h.id} center={[h.lat, h.lon]} radius={5} pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.8 }}>
            <Popup><b>{h.place}</b><br />{h.date} · {h.severity}<br />{h.trigger}<br /><i>{h.source}</i></Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {/* floating tactical HUD */}
      <div className="hud hud-tr">
        <div className="mono">{selected.zone.lat.toFixed(4)}° N, {selected.zone.lon.toFixed(4)}° E · {selected.zone.elevationM.toLocaleString()}m</div>
        <div className="muted">{selected.zone.place} · {BASES[base].label}</div>
        <div className="hud-btns">
          {(Object.keys(BASES) as Base[]).map(b => (
            <button key={b} className={base === b ? 'chip active' : 'chip'} onClick={() => setBase(b)}>{b === 'dark' ? '🌑' : b === 'satellite' ? '🛰️' : b === 'topo' ? '🏔️' : '🗺️'}</button>
          ))}
        </div>
      </div>
      <div className="hud hud-bl">
        <span><span className="dot" style={{ background: '#22c55e' }} />{levelName(lang, 'LOW')}</span>{' '}
        <span><span className="dot" style={{ background: '#eab308' }} />{levelName(lang, 'MODERATE')}</span>{' '}
        <span><span className="dot" style={{ background: '#f97316' }} />{levelName(lang, 'HIGH')}</span>{' '}
        <span><span className="dot" style={{ background: '#ef4444' }} />{levelName(lang, 'CRITICAL')}</span>
      </div>
      </div>
      <p className="muted">{t(lang, 'baseMap')}: {BASES[base].label} · {t(lang, 'mapNote')} {demoBoost > 0 ? t(lang, 'demoBoost') : ''}</p>
    </div>
  );
}

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

function LocateControl({ zones, lang, onFound }: { zones: { zone: NerZone }[]; lang: Lang; onFound: (msg: string, id?: string) => void }) {
  const map = useMap();
  return (
    <button
      className="btn"
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 500 }}
      onClick={() => {
        if (!navigator.geolocation) { onFound(t(lang, 'noGeo')); return; }
        onFound(t(lang, 'locating'));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const hit = nearestZone(zones.map(z => z.zone), latitude, longitude);
            map.flyTo([latitude, longitude], 11, { duration: 1.4 });
            onFound(
              hit ? `GPS ${latitude.toFixed(3)}, ${longitude.toFixed(3)} — ${t(lang, 'nearZone')}: ${hit.zone.place} (~${hit.km} km). ${t(lang, 'verifyPlace')}` : t(lang, 'locFound'),
              hit?.zone.id,
            );
          },
          () => onFound(t(lang, 'locBlocked')),
          { timeout: 12000 },
        );
      }}
    >{t(lang, 'locMe')}</button>
  );
}
