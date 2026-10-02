# NER LandslideGuard — 

**AI-Based Early Warning and Landslide Risk Monitoring System for North Eastern Region (NER)**
Org: Ministry of Development of North Eastern Region (MDoNER) · Domain: Disaster Management.

> Prototype/hackathon build. All rainfall, soil-moisture and model outputs are **SIMULATED demo data** unless a live provider is wired in. Risk estimates are decision-support only — not a substitute for DDMA/GSI field verification. Historical rows marked DEMO are synthetic placeholders (only Noney/Tupul 2022 references a widely reported real event — verify counts against official records).

## Flow
```
ENV DATA → PROCESSING → AI RISK SCORE → GIS MAP → EARLY WARNING → AUTHORITY RESPONSE → FIELD REPORT → UPDATE
```

## Run
```bash
npm install
npm run dev    # http://localhost:5173
npm run build
```

## Stack
React 19 + Vite 6 + TS · Leaflet/OSM (no key) · Recharts · localStorage mock for reports/alerts.

## Structure
```
src/
  data/nerDistricts.ts   # 18 monitored NER zones (demo readings)
  data/historical.ts     # 1 real-ref + demo placeholder incidents
  lib/riskEngine.ts      # explainable weighted-logistic risk model
  lib/store.ts           # reports/alerts persistence, photo note, trends
  App.tsx                # Dashboard/Map/Monitoring/Predictions/Alerts/Incidents/Infra/Reports/Sim/Community/Admin
```

## Judge demo (60 sec)
1. Dashboard → note top risk zone.
2. **▶ Demo: Heavy Rain** → rainfall +80mm, scores recompute.
3. Risk Map → marker turns ORANGE/RED, click for factor breakdown.
4. Alerts → warning generated (mock SMS/email, labeled simulation).
5. Infrastructure → exposed roads/rail.
6. Community → submit report → Admin → VERIFIED.

## To productionize
- IMD AWS/ARG rain API, GSI Bhukosh susceptibility, NRSC DEM/soil layers.
- Train RF/XGBoost on curated slide inventory; log feature importance.
- Backend + auth + PostGIS; SMS/email gateway; push; offline tile packs.
