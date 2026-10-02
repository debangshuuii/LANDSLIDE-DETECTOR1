import { useState } from 'react';
import * as exifr from 'exifr';
import { NER_ZONES } from '../data/nerDistricts';
import { makeId, photoPrelimAssessment, type CommunityReport } from '../lib/store';
import { nearestZone } from '../lib/geo';
import { TEK_OPTIONS } from '../lib/eco';
import { t, type Lang } from '../lib/i18n';

const STATES = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
const SEVS = ['minor', 'moderate', 'major', 'catastrophic'] as const;

export default function CommunityForm({ reports, setReports, lang }: { reports: CommunityReport[]; setReports: (fn: (p: CommunityReport[]) => CommunityReport[]) => void; lang: Lang }) {
  const [form, setForm] = useState({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' });
  const [aiNote, setAiNote] = useState('');
  const [gpsNote, setGpsNote] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [tek, setTek] = useState<string[]>([]);
  const toggleTek = (k: string) => setTek(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  const sevLabel = (s: string) => s === 'minor' ? t(lang, 'minor') : s === 'major' ? t(lang, 'major') : s === 'catastrophic' ? t(lang, 'catastrophic') : t(lang, 'moderate');

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGpsNote(t(lang, 'noGeo')); return; }
    setGpsNote(t(lang, 'locating'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const hit = nearestZone(NER_ZONES, pos.coords.latitude, pos.coords.longitude);
        setGpsNote(hit
          ? `GPS ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} — ${t(lang, 'nearZone')}: ${hit.zone.place} (~${hit.km} km). ${t(lang, 'verifyPlace')}`
          : t(lang, 'locFound'));
      },
      () => setGpsNote(t(lang, 'locBlocked')),
      { timeout: 12000 },
    );
  };

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    setPhotoName(f.name);
    setAiNote(photoPrelimAssessment(f, lang));
    try {
      const gps = await exifr.gps(f).catch(() => null) as { latitude?: number; longitude?: number } | null;
      if (gps?.latitude && gps?.longitude) {
        const hit = nearestZone(NER_ZONES, gps.latitude, gps.longitude);
        setGpsNote(`GPS ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}${hit ? ` — ${t(lang, 'nearZone')} ${hit.zone.place} (~${hit.km} km)` : ''}.`);
      } else {
        setGpsNote(gpsNote || t(lang, 'noGpsTag'));
      }
    } catch { /* EXIF read failed: keep the AI note only */ }
  };

  return (
    <div className="grid g2">
      <div className="card"><h3>{t(lang, 'reportLs')}</h3>
        <div className="row"><button className="btn" onClick={useMyLocation}>{t(lang, 'useMyLoc')}</button></div>
        {gpsNote && <p className="muted" role="status">{gpsNote}</p>}
        <label htmlFor="cf-place">{t(lang, 'placeL')}</label><input id="cf-place" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} placeholder="e.g. Mawiongrim" />
        <label htmlFor="cf-dist">{t(lang, 'districtL')}</label><input id="cf-dist" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. East Khasi Hills" />
        <label htmlFor="cf-state">{t(lang, 'stateL')}</label><select id="cf-state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>{STATES.map(s => <option key={s}>{s}</option>)}</select>
        <label htmlFor="cf-sev">{t(lang, 'sevL')}</label><select id="cf-sev" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>{SEVS.map(s => <option key={s} value={s === 'minor' ? 'Minor' : s === 'major' ? 'Major' : s === 'catastrophic' ? 'Catastrophic' : 'Moderate'}>{sevLabel(s)}</option>)}</select>
        <label htmlFor="cf-road" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input id="cf-road" type="checkbox" style={{ width: 16 }} checked={form.roadBlocked} onChange={e => setForm({ ...form, roadBlocked: e.target.checked })} /> {t(lang, 'roadBlocked')}</label>
        <label htmlFor="cf-desc">{t(lang, 'descL')}</label><textarea id="cf-desc" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label>{t(lang, 'tekTitle')}</label>
        <div className="row">{TEK_OPTIONS.map(k => (
          <label key={k} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', border: tek.includes(k) ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 15 }} checked={tek.includes(k)} onChange={() => toggleTek(k)} />{t(lang, k)}
          </label>
        ))}</div>
        <label htmlFor="cf-photo">{t(lang, 'photoL')}</label>
        <input id="cf-photo" type="file" accept="image/*" capture="environment" onChange={e => { void onPhoto(e.target.files?.[0]); }} />
        {photoName && <p className="muted">{t(lang, 'attached')}: {photoName}</p>}
        {aiNote && <p className="muted">{aiNote}</p>}
        <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={() => {
          if (!form.place || !form.district) { alert(t(lang, 'needPlace')); return; }
          setReports(prev => [{ id: makeId('r'), ...form, date: new Date().toLocaleString(), status: 'NEW' as const, aiNote: [aiNote, gpsNote].filter(Boolean).join(' | '), photoName, tek }, ...prev].slice(0, 100));
          setForm({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' }); setAiNote(''); setGpsNote(''); setPhotoName(''); setTek([]);
        }}>{t(lang, 'submit')}</button></div>
        <p className="muted">{t(lang, 'offlineNote')}</p>
      </div>
      <div className="card"><h3>{t(lang, 'submitted')} ({reports.length})</h3>{reports.map(r => <div key={r.id} className="card" style={{ marginTop: 8 }}><b>{r.place}</b> <span className="badge">{r.status}</span><p className="muted">{r.district}, {r.state} · {r.severity}</p>{r.tek && r.tek.length > 0 && <ul className="muted">{r.tek.map(k => <li key={k}>{t(lang, k)}</li>)}</ul>}</div>)}</div>
    </div>
  );
}
