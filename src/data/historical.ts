// Historical landslide records.
// IMPORTANT: Demo/illustrative dataset for hackathon prototype.
// Only the Noney (Tupul) 2022 event below is a widely reported real event
// (railway construction site, Noney district, Manipur, 30 June 2022).
// All other rows are SYNTHETIC placeholders — replace with GSI Bhukosh /
// NDMA / state disaster-management records before any official use.

export interface HistoricalIncident {
  id: string;
  place: string;
  district: string;
  state: string;
  date: string;
  trigger: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Catastrophic';
  deathsReported: number | null;
  infraImpact: string;
  source: string;
  demo: boolean;
  lat: number;
  lon: number;
}

export const HISTORICAL_INCIDENTS: HistoricalIncident[] = [
  { id: 'h-noney-2022', place: 'Tupul railway yard', district: 'Noney', state: 'Manipur', date: '2022-06-30', trigger: 'Heavy rainfall + slope excavation', severity: 'Catastrophic', deathsReported: 61, infraImpact: 'Railway construction camp buried, NH-37 cut off', source: 'Widely reported (NDMA/state reports) — verify count with official record', demo: false, lat: 24.78, lon: 93.58 },
  { id: 'h-haflong-2022', place: 'Haflong–Lumding rail section', district: 'Dima Hasao', state: 'Assam', date: '2022-05-15', trigger: 'Extreme pre-monsoon rain', severity: 'Major', deathsReported: null, infraImpact: 'Rail link snapped (DEMO row — verify with NFR records)', source: 'Demo/illustrative — replace with NFR/GSI record', demo: true, lat: 25.18, lon: 93.03 },
  { id: 'h-aizawl-2023', place: 'Hlimen ridge', district: 'Aizawl', state: 'Mizoram', date: '2023-05-28', trigger: 'Prolonged rainfall, saturated shale', severity: 'Moderate', deathsReported: null, infraImpact: 'Houses damaged, ridge road blocked (DEMO row)', source: 'Demo/illustrative — replace with state DDMA record', demo: true, lat: 23.72, lon: 92.71 },
  { id: 'h-gangtok-2023', place: 'NH-10 29th Mile', district: 'Gangtok', state: 'Sikkim', date: '2023-10-05', trigger: 'Teesta surge + cloudburst (GLOF period)', severity: 'Major', deathsReported: null, infraImpact: 'NH-10 segments washed/slipped (DEMO row)', source: 'Demo/illustrative — replace with BRO/GSI record', demo: true, lat: 27.2, lon: 88.55 },
  { id: 'h-shillong-2022', place: 'Mawiongrim', district: 'East Khasi Hills', state: 'Meghalaya', date: '2022-06-17', trigger: 'Record monsoon rain', severity: 'Moderate', deathsReported: null, infraImpact: 'Rural road blocked (DEMO row)', source: 'Demo/illustrative — replace with DDMA record', demo: true, lat: 25.6, lon: 91.85 },
  { id: 'h-kohima-2021', place: 'Kohima–Dimapur NH-29', district: 'Kohima', state: 'Nagaland', date: '2021-07-22', trigger: 'Slope cut failure', severity: 'Minor', deathsReported: null, infraImpact: 'Traffic halted 8 hrs (DEMO row)', source: 'Demo/illustrative', demo: true, lat: 25.67, lon: 94.1 },
  { id: 'h-tawang-2020', place: 'Sela approach', district: 'Tawang', state: 'Arunachal Pradesh', date: '2020-08-04', trigger: 'Cloudburst', severity: 'Moderate', deathsReported: null, infraImpact: 'BCT road blocked (DEMO row)', source: 'Demo/illustrative', demo: true, lat: 27.5, lon: 91.9 },
  { id: 'h-lunglei-2022', place: 'Lunglei town fringe', district: 'Lunglei', state: 'Mizoram', date: '2022-07-09', trigger: 'Saturated clay slope', severity: 'Minor', deathsReported: null, infraImpact: '2 houses evacuated (DEMO row)', source: 'Demo/illustrative', demo: true, lat: 22.88, lon: 92.73 },
];
