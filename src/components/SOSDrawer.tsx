import { useState } from 'react';
import { t, type Lang } from '../lib/i18n';

export default function SOSDrawer({ place, district, infra, lang }: { place: string; district: string; infra: string[]; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const sms = `LANDSLIDE ${place} (${district}) road blocked? _ rain? _ casualties? _ — sender _`;
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
          <p className="mono" style={{ fontSize: 12 }}>{sms}</p>
          <div className="row"><button className="btn" onClick={() => { void copy(); }}>{copied ? t(lang, 'copiedMsg') : t(lang, 'copyBtn')}</button></div>
        </div></div>
        </>
      )}
    </>
  );
}
