import { useState } from 'react';
import * as exifr from 'exifr';
import { NER_ZONES } from '../data/nerDistricts';
import { makeId, photoPrelimAssessment, type CommunityReport } from '../lib/store';
import { nearestZone } from '../lib/geo';

export default function CommunityForm({ reports, setReports }: { reports: CommunityReport[]; setReports: (fn: (p: CommunityReport[]) => CommunityReport[]) => void }) {
  const [form, setForm] = useState({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' });
  const [aiNote, setAiNote] = useState('');
  const [gpsNote, setGpsNote] = useState('');
  const [photoName, setPhotoName] = useState('');

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGpsNote('Geolocation not supported here'); return; }
    setGpsNote('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const hit = nearestZone(NER_ZONES, pos.coords.latitude, pos.coords.longitude);
        setGpsNote(hit
          ? `GPS ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} — nearest monitored zone: ${hit.zone.place} (~${hit.km} km). Verify place name before submit.`
          : 'Location found.');
      },
      () => setGpsNote('Location blocked — allow GPS permission and retry.'),
      { timeout: 12000 },
    );
  };

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    setPhotoName(f.name);
    setAiNote(photoPrelimAssessment(f));
    // Try EXIF GPS from the camera photo (real field accuracy).
    try {
      const gps = await exifr.gps(f).catch(() => null) as { latitude?: number; longitude?: number } | null;
      if (gps?.latitude && gps?.longitude) {
        const hit = nearestZone(NER_ZONES, gps.latitude, gps.longitude);
        setGpsNote(`Photo GPS ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}${hit ? ` — nearest zone ${hit.zone.place} (~${hit.km} km)` : ''}.`);
      } else {
        setGpsNote(gpsNote || 'No GPS tag in this photo — use "Use my location" or type the place.');
      }
    } catch { /* EXIF read failed: keep the AI note only */ }
  };

  return (
    <div className="grid g2">
      <div className="card"><h3>Report landslide (field / citizen)</h3>
        <div className="row"><button className="btn" onClick={useMyLocation}>📍 Use my location</button></div>
        {gpsNote && <p className="muted" role="status">{gpsNote}</p>}
        <label htmlFor="cf-place">Place</label><input id="cf-place" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} placeholder="e.g. Mawiongrim" />
        <label htmlFor="cf-dist">District</label><input id="cf-dist" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. East Khasi Hills" />
        <label htmlFor="cf-state">State</label><select id="cf-state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>{['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map(s => <option key={s}>{s}</option>)}</select>
        <label htmlFor="cf-sev">Severity</label><select id="cf-sev" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}><option>Minor</option><option>Moderate</option><option>Major</option><option>Catastrophic</option></select>
        <label htmlFor="cf-road" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input id="cf-road" type="checkbox" style={{ width: 16 }} checked={form.roadBlocked} onChange={e => setForm({ ...form, roadBlocked: e.target.checked })} /> Road blocked?</label>
        <label htmlFor="cf-desc">Description</label><textarea id="cf-desc" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label htmlFor="cf-photo">Photo (camera or upload — AI preliminary note only)</label>
        <input id="cf-photo" type="file" accept="image/*" capture="environment" onChange={e => { void onPhoto(e.target.files?.[0]); }} />
        {photoName && <p className="muted">Attached: {photoName}</p>}
        {aiNote && <p className="muted">{aiNote}</p>}
        <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={() => {
          if (!form.place || !form.district) { alert('Add place + district'); return; }
          setReports(prev => [{ id: makeId('r'), ...form, date: new Date().toLocaleString(), status: 'NEW' as const, aiNote: [aiNote, gpsNote].filter(Boolean).join(' | '), photoName }, ...prev].slice(0, 100));
          setForm({ place: '', district: '', state: 'Meghalaya', severity: 'Moderate', roadBlocked: false, description: '' }); setAiNote(''); setGpsNote(''); setPhotoName('');
        }}>Submit (saved locally, status NEW)</button></div>
        <p className="muted">Offline-friendly: drafts persist in this browser; queue + sync when online.</p>
      </div>
      <div className="card"><h3>Submitted ({reports.length})</h3>{reports.map(r => <div key={r.id} className="card" style={{ marginTop: 8 }}><b>{r.place}</b> <span className="badge">{r.status}</span><p className="muted">{r.district}, {r.state} · {r.severity}</p></div>)}</div>
    </div>
  );
}
