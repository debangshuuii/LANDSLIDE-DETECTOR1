import { CORRIDORS, corridorStatus } from '../data/corridors';
import { t, type Lang } from '../lib/i18n';

function statusLabel(lang: Lang, st: string): string {
  if (st === 'BLOCKED') return t(lang, 'stBlocked');
  if (st === 'RESTRICTED') return t(lang, 'stRestr');
  return t(lang, 'stOpen');
}

export default function CorridorMonitor({ levelOf, lang }: { levelOf: (zoneId: string) => string; lang: Lang }) {
  return (
    <div className="card">
      <h3>{t(lang, 'corrTitle')} <span className="badge sim">{t(lang, 'demoRule')}</span></h3>
      <div className="tablewrap"><table className="table">
        <thead><tr><th>{t(lang, 'thCorr')}</th><th>{t(lang, 'thSeg')}</th><th>{t(lang, 'thStatus')}</th><th>{t(lang, 'thBypass')}</th></tr></thead>
        <tbody>{CORRIDORS.map((c, i) => {
          const st = corridorStatus(c.zoneIds.map(levelOf));
          const color = st === 'BLOCKED' ? '#ef4444' : st === 'RESTRICTED' ? '#f97316' : '#22c55e';
          return <tr key={i}><td>{c.corridor}</td><td>{c.name}</td><td><span className="riskpill" style={{ background: color }}>{statusLabel(lang, st)}</span></td><td className="muted">{c.bypass}</td></tr>;
        })}</tbody>
      </table></div>
      <p className="muted">{t(lang, 'mapNote')}</p>
    </div>
  );
}
