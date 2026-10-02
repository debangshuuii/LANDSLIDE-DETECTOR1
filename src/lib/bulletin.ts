// Official bulletin helpers: reference numbers, directives, full CSV export.
// Keeps all "publication" logic out of App.tsx.

export interface BulletinZoneRow {
  zoneId: string;
  place: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  elevationM: number;
  slopeDeg: number;
  soil: string;
  rain24mm: number;
  rain7dmm: number;
  soilMoisturePct: number;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  roads: string[];
  infrastructure: string[];
  populationExposed: number;
  action: string;
}

export function bulletinRef(at = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `BD-NER/${at.getFullYear()}/BUL-${at.getFullYear()}${p(at.getMonth() + 1)}${p(at.getDate())}-${p(at.getHours())}${p(at.getMinutes())}`;
}

export function bannerFor(overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'): { label: string; color: string } {
  if (overall === 'CRITICAL') return { label: 'CRITICAL', color: '#b91c1c' };
  if (overall === 'HIGH') return { label: 'HIGH', color: '#c2410c' };
  if (overall === 'MODERATE') return { label: 'MODERATE', color: '#a16207' };
  return { label: 'ADVISORY', color: '#15803d' };
}

export function levelCode(level: string): string {
  return level === 'CRITICAL' ? 'RED' : level === 'HIGH' ? 'ORANGE' : level === 'MODERATE' ? 'YELLOW' : 'GREEN';
}

export function directives(overall: string, topPlace: string): { to: string; points: string[] }[] {
  const esc = overall === 'CRITICAL' || overall === 'HIGH';
  return [
    {
      to: 'DDMA (District control rooms)',
      points: esc
        ? [`Activate control room in ${topPlace} sector; hourly rainfall watch.`, 'Pre-position JCB/excavator near known slide points; keep NH night-patrol on alert.', 'Verify community reports within 6 hours; escalate RED zones to state HQ.']
        : ['Routine monitoring; verify community reports within 24 hours.', `Watch ${topPlace} sector after next rainfall update.`],
    },
    {
      to: 'Traffic Police / BRO',
      points: esc
        ? ['Regulate or halt night movement on flagged NH segments; publish diversion (see corridor table).', 'Deploy signage + spotters at toe-erosion stretches during downpour.']
        : ['Keep monsoon signage in place; report waterlogging/slips on priority corridors.'],
    },
    {
      to: 'NDRF / SDRF',
      points: esc
        ? ['Keep one team on standby for the highest-risk district; check comms + medical kits.', 'Rehearse evacuation of toe settlements listed in exposure table.']
        : ['No mobilization required; maintain seasonal readiness.'],
    },
    {
      to: 'Citizens & travellers',
      points: esc
        ? ['Avoid non-essential hill travel during intense rain; obey police diversions.', 'Never stop under cut slopes; report cracks, tilting poles, muddy seepage to 1078 / 112.']
        : ['Travel permitted; re-check bulletin before hill journeys in monsoon.'],
    },
  ];
}

export function csvEscape(v: string | number): string {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildFullCsv(meta: { at: string; zones: number; severe: number; source: string }, rows: BulletinZoneRow[]): string {
  const lines: string[] = [
    [csvEscape('BhoomiDrishti NER — Risk Register (audit export)'), ''].join(','),
    [csvEscape('Generated At'), csvEscape(meta.at)].join(','),
    [csvEscape('Monitored Zones'), csvEscape(String(meta.zones))].join(','),
    [csvEscape('Severe Threat Count (HIGH+CRITICAL)'), csvEscape(String(meta.severe))].join(','),
    [csvEscape('Data Source'), csvEscape(meta.source)].join(','),
    '',
    ['Zone ID', 'Place', 'District', 'State', 'Latitude', 'Longitude', 'Elevation (m)', 'Slope (°)', 'Soil Type', '24h Rain (mm)', '7d Rain (mm)', 'Soil Moisture (%)', 'Risk Score (0-100)', 'Alert Level', 'Primary Factor', 'Exposed Roads', 'Exposed Infrastructure', 'Population at Risk', 'Recommended Action'].map(csvEscape).join(','),
    ...rows.map(r => [r.zoneId, r.place, r.district, r.state, r.lat, r.lon, r.elevationM, r.slopeDeg, r.soil, r.rain24mm, r.rain7dmm, r.soilMoisturePct, r.score, `${r.level} (${levelCode(r.level)})`, r.reasons[0] ?? '', r.roads.join('; '), r.infrastructure.join('; '), r.populationExposed, r.action].map(csvEscape).join(',')),
  ];
  return lines.join('\r\n');
}

export function downloadTextFile(name: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
