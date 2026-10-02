import { useState } from 'react';
import { t, type Lang } from '../lib/i18n';

export default function SOSDrawer({ place, district, infra, rainMm, live, lang }: {
  place: string; district: string; infra: string[]; rainMm: number; live: boolean; lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [road, setRoad] = useState<'BLOCKED' | 'OPEN' | 'UNKNOWN'>('UNKNOWN');
  const [cas, setCas] = useState('0');
  const [stranded, setStranded] = useState('0');
  const [cb, setCb] = useState('');
  const [sender, setSender] = useState('');
  const now = new Date();
  const p2 = (n: number) => String(n).padStart(2, '0');
  const stamp = `${p2(now.getHours())}:${p2(now.getMinutes())} ${p2(now.getDate())}-${p2(now.getMonth() + 1)}`;
  const roadWord = road === 'UNKNOWN' ? t(lang, 'smsUnknown') : road === 'BLOCKED' ? t(lang, 'stBlocked') : t(lang, 'stOpen');
  // Structured, SMS-segment-friendly emergency message (English codes + local details).
  const sms = `SOS LANDSLIDE ${place.toUpperCase()}, ${district.toUpperCase()} ${stamp} ROAD:${road} RAIN:${Math.round(rainMm)}mm${live ? '' : '(est)'} CAS:${cas || 0} STRANDED:${stranded || 0}${cb ? ` CB:${cb}` : ''}${sender ? ` — ${sender}` : ''} via BhoomiDrishti`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(sms); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = sms; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <>
      <button className="sos-pill" onClick={() => setOpen(v => !v)} aria-expanded={open}>{t(lang, 'sosBtn')}</button>
      {open && (
        <>
        <div className="sos-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
        <div className="sos-modal"><div className="card">
          <h3>{t(lang, 'sosTitle')} — {place}</h3>
          <p className="muted">{t(lang, 'sosCall')}</p>
          <a className="sos-call" href="tel:1078">📞 NDRF 1078</a>
          <a className="sos-call" href="tel:1070">📞 DDMA 1070</a>
          <a className="sos-call" href="tel:112">📞 Police 112</a>
          <p className="muted" style={{ marginTop: 8 }}>{t(lang, 'sosShelter')}</p>
          <ul className="muted">{infra.slice(0, 4).map(x => <li key={x}>{x}</li>)}</ul>
          <p className="muted">{t(lang, 'sosSms')}</p>
          <div className="grid g2">
            <div><label>{t(lang, 'smsRoad')}</label><select value={road} onChange={e => setRoad(e.target.value as 'BLOCKED' | 'OPEN' | 'UNKNOWN')}><option value="BLOCKED">{t(lang, 'stBlocked')}</option><option value="OPEN">{t(lang, 'stOpen')}</option><option value="UNKNOWN">{t(lang, 'smsUnknown')}</option></select></div>
            <div><label>{t(lang, 'smsCas')}</label><input inputMode="numeric" value={cas} onChange={e => setCas(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} /></div>
            <div><label>{t(lang, 'smsStrand')}</label><input inputMode="numeric" value={stranded} onChange={e => setStranded(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} /></div>
            <div><label>{t(lang, 'smsCb')}</label><input inputMode="tel" value={cb} onChange={e => setCb(e.target.value.replace(/[^0-9+ ]/g, '').slice(0, 15))} placeholder="+91" /></div>
          </div>
          <label>{t(lang, 'smsName')}</label><input value={sender} onChange={e => setSender(e.target.value.slice(0, 30))} />
          <p className="mono" style={{ fontSize: 12, background: '#0a1326', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginTop: 8 }}>
            🆘 LANDSLIDE <b>{place}</b>, {district} · {stamp}<br />
            {t(lang, 'smsRoad')}: <b>{roadWord}</b> · 💧{Math.round(rainMm)}mm{live ? '' : '(est)'} · {t(lang, 'smsCas')}: <b>{cas || 0}</b> · {t(lang, 'smsStrand')}: <b>{stranded || 0}</b>{cb && <span> · 📞{cb}</span>}{sender && <span> — {sender}</span>}
          </p>
          <p className="muted" style={{ fontSize: 11 }}>SMS text: {sms}</p>
          <div className="row"><button className="btn" onClick={() => { void copy(); }}>{copied ? t(lang, 'copiedMsg') : t(lang, 'copyBtn')}</button></div>
        </div></div>
        </>
      )}
    </>
  );
}
