import { CORRIDORS, corridorStatus } from '../data/corridors';

export default function CorridorMonitor({ levelOf }: { levelOf: (zoneId: string) => string }) {
  return (
    <div className="card">
      <h3>Highway Corridor Status <span className="badge sim">DEMO RULE (worst zone risk)</span></h3>
      <div className="tablewrap"><table className="table">
        <thead><tr><th>Corridor</th><th>Segment</th><th>Status</th><th>Bypass if cut</th></tr></thead>
        <tbody>{CORRIDORS.map((c, i) => {
          const st = corridorStatus(c.zoneIds.map(levelOf));
          const color = st === 'BLOCKED' ? '#ef4444' : st === 'RESTRICTED' ? '#f97316' : '#22c55e';
          return <tr key={i}><td>{c.corridor}</td><td>{c.name}</td><td><span className="riskpill" style={{ background: color }}>{st}</span></td><td className="muted">{c.bypass}</td></tr>;
        })}</tbody>
      </table></div>
      <p className="muted">Not a live traffic feed — status = worst monitored-zone risk on that segment. Wire BRO/state traffic API for production.</p>
    </div>
  );
}
