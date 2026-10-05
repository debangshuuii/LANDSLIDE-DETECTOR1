import { SOURCES, DATA_MODE, type SourceStatus } from '../lib/dataMode';
import { t, type Lang } from '../lib/i18n';

export function DataModeBadge({ lang }: { lang: Lang }) {
  return <span className={DATA_MODE === 'LIVE' ? 'badge live' : 'badge sim'}>{DATA_MODE} DATA</span>;
}

const chip = (s: SourceStatus) =>
  s === 'LIVE' ? <span className="badge live">LIVE</span> : s === 'ESTIMATED' ? <span className="badge sim">ESTIMATED</span> : <span className="badge sim">SIMULATED</span>;

export default function DataAbout({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  return (
    <>
      <div className="sos-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sos-modal"><div className="card">
        <h3>ⓘ {t(lang, 'aboutDataT')}</h3>
        <p className="muted">{t(lang, 'aboutDataD')} <DataModeBadge lang={lang} /></p>
        <div className="tablewrap"><table className="table">
          <thead><tr><th>{t(lang, 'thMetric')}</th><th>{t(lang, 'thMethod')}</th><th>{t(lang, 'thState')}</th></tr></thead>
          <tbody>{SOURCES.map(s => (
            <tr key={s.metric}><td data-label={t(lang, 'thMetric')}><b>{s.metric}</b><div className="muted">{s.meaning}</div><div className="muted">→ {s.future}</div></td><td data-label={t(lang, 'thMethod')}>{s.method}</td><td data-label={t(lang, 'thState')}>{chip(s.status)}</td></tr>
          ))}</tbody>
        </table></div>
        <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={onClose}>OK</button></div>
      </div></div>
    </>
  );
}
