// Single source of truth for data honesty.
// DEMO = at least one input is simulated/estimated. Flip to 'LIVE' only when
// every feed below is a real measured API response — never mixed silently.

export const DATA_MODE: string = 'DEMO';

export type SourceStatus = 'LIVE' | 'ESTIMATED' | 'SIMULATED';

export interface SourceInfo {
  metric: string;
  meaning: string;
  method: string;
  status: SourceStatus;
  future: string;
}

export const SOURCES: SourceInfo[] = [
  { metric: 'Rainfall 24h / 7d', meaning: 'Measured precipitation at zone coordinates', method: 'Open-Meteo forecast API, hourly sums', status: 'LIVE', future: 'IMD AWS/ARG gauges' },
  { metric: 'Soil moisture', meaning: 'Water content of topsoil', method: 'Estimated from 7-day rain (45 + rain/5)', status: 'ESTIMATED', future: 'IMD agromet / SMAP' },
  { metric: 'Canopy / NDVI', meaning: 'Vegetation cover and health', method: 'Curated demo values per zone', status: 'SIMULATED', future: 'Sentinel-2 / Copernicus / ISFR' },
  { metric: 'Terrain & slope', meaning: 'Elevation, slope angle, soil class', method: 'Static reference table', status: 'ESTIMATED', future: 'SRTM DEM / NBSS soil maps' },
  { metric: 'Slide history', meaning: 'Past landslide incidents', method: '1 verified event + labeled demo rows', status: 'ESTIMATED', future: 'GSI Bhukosh inventory' },
  { metric: 'Risk scores', meaning: 'Landslide + environmental indices', method: 'Weighted heuristic model, fully explainable', status: 'ESTIMATED', future: 'RandomForest trained on GSI+IMD data' },
];
