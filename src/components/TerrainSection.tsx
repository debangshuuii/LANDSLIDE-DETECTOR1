// Schematic slope cross-section: crown scarp, slip plane, toe + road.
// Geometry reacts to slope + moisture (deeper/longer slip when saturated).
// NOT a surveyed section — labeled schematic in the UI.

export default function TerrainSection({ slopeDeg, moisturePct }: { slopeDeg: number; moisturePct: number }) {
  const steep = Math.min(1, Math.max(0, (slopeDeg - 15) / 25)); // 0..1
  const peakY = 150 - steep * 105;
  const depth = 118 + (moisturePct - 50) * 0.7; // slip plane sags when wet
  const slip = `M 128 96 Q 230 ${depth} 336 162`;
  const col = moisturePct >= 78 ? '#ef4444' : moisturePct >= 60 ? '#f97316' : '#eab308';
  return (
    <svg viewBox="0 0 400 200" width="100%" role="img" aria-label="Schematic slope cross-section" style={{ maxHeight: 220 }}>
      {/* mountain body */}
      <polygon points={`200,${peakY} 40,178 360,178`} fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="2" />
      {/* strata lines */}
      <path d="M 150 120 L 260 120 M 120 145 L 300 145 M 175 100 L 235 100" stroke="#22345c" strokeWidth="1.5" fill="none" />
      {/* crown scarp */}
      <line x1="128" y1="82" x2="150" y2="104" stroke="#fef08a" strokeWidth="3" />
      <text x="112" y="74" fill="#fef08a" fontSize="11">crown</text>
      {/* slip plane (pulses) */}
      <path d={slip} fill="none" stroke={col} strokeWidth="3" strokeDasharray="8 5" className="pulse-crit" />
      <text x="238" y={Math.min(185, depth - 8)} fill={col} fontSize="11">slip plane</text>
      {/* toe road + river */}
      <line x1="300" y1="168" x2="372" y2="168" stroke="#e8eefc" strokeWidth="4" strokeDasharray="6 3" />
      <text x="302" y="160" fill="#e8eefc" fontSize="11">road</text>
      <path d="M 20 188 Q 60 182 100 188 T 180 188 T 260 188 T 340 188" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.8" />
      <text x="22" y="180" fill="#38bdf8" fontSize="11">river</text>
    </svg>
  );
}
