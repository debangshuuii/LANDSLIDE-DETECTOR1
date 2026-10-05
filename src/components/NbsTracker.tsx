import { useEffect, useState } from 'react';
import { nbsFor } from '../lib/eco';
import { t, type Lang } from '../lib/i18n';
import type { NerZone } from '../data/nerDistricts';

const KEY = 'bhoomi-nbs-v1';
const ORDER = ['stRec', 'stPlanned', 'stImpl', 'stMonit'] as const;

function load(): Record<string, Record<string, string>> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

// Per-zone Nature-Based Solutions tracker with a persisted status pipeline.
export default function NbsTracker({ zone, lang }: { zone: NerZone; lang: Lang }) {
  const [states, setStates] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(states)); } catch { /* ignore */ }
  }, [states]);
  const items = nbsFor(zone);
  const advance = (name: string) => {
    const cur = states[zone.id]?.[name] ?? 'stRec';
    const next = ORDER[(ORDER.indexOf(cur as (typeof ORDER)[number]) + 1) % ORDER.length];
    setStates(prev => ({ ...prev, [zone.id]: { ...prev[zone.id], [name]: next } }));
  };
  return (
    <div>
      <h3>{t(lang, 'nbsTrackT')}</h3>
      {items.map(n => {
        const st = states[zone.id]?.[n.name] ?? 'stRec';
        return (
          <div key={n.name} className="row" style={{ justifyContent: 'space-between', margin: '6px 0' }}>
            <span><b>{n.name}</b> <span className="badge">{t(lang, st)}</span><div className="muted">{t(lang, n.whyKey)}</div></span>
            <button className="btn" onClick={() => advance(n.name)}>→ {t(lang, ORDER[(ORDER.indexOf(st as (typeof ORDER)[number]) + 1) % ORDER.length])}</button>
          </div>
        );
      })}
    </div>
  );
}
