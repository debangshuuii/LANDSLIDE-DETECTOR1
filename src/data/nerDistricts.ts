// NER monitored zones — DEMO/SIMULATED baseline dataset.
// Replace with GSI Bhukosh / IMD / NRSC inputs for production.
// Coordinates are district headquarters (approx, public knowledge).

export interface NerZone {
  id: string;
  state: string;
  district: string;
  place: string;
  lat: number;
  lon: number;
  elevationM: number;
  slopeDeg: number;
  soil: string;
  landCover: string;
  distRiverM: number;
  histCount5y: number;
  // simulated live readings (Demo Mode)
  rainfall24mm: number;
  rainfall7dmm: number;
  soilMoisturePct: number;
  roads: string[];
  infrastructure: string[];
  populationExposed: number;
}

export const NER_ZONES: NerZone[] = [
  { id: 'shillong-ekh', state: 'Meghalaya', district: 'East Khasi Hills', place: 'Shillong', lat: 25.5788, lon: 91.8933, elevationM: 1525, slopeDeg: 28, soil: 'Clay-Loam', landCover: 'Urban / Forest fringe', distRiverM: 900, histCount5y: 14, rainfall24mm: 142, rainfall7dmm: 386, soilMoisturePct: 78, roads: ['NH-6 Shillong–Guwahati', 'Shillong–Dawki Rd'], infrastructure: ['2 schools', '1 hospital', 'NH-6 bridge'], populationExposed: 42000 },
  { id: 'haflong-dima', state: 'Assam', district: 'Dima Hasao', place: 'Haflong', lat: 25.1800, lon: 93.0300, elevationM: 953, slopeDeg: 34, soil: 'Lateritic', landCover: 'Forest / Jhum', distRiverM: 450, histCount5y: 19, rainfall24mm: 168, rainfall7dmm: 442, soilMoisturePct: 84, roads: ['NH-27 Haflong stretch', 'Lumding–Silchar rail'], infrastructure: ['Rail section', '1 hospital', '3 schools'], populationExposed: 28000 },
  { id: 'tawang', state: 'Arunachal Pradesh', district: 'Tawang', place: 'Tawang', lat: 27.5861, lon: 91.8598, elevationM: 3048, slopeDeg: 38, soil: 'Sandy-Loam / Rocky', landCover: 'Alpine / Forest', distRiverM: 600, histCount5y: 9, rainfall24mm: 68, rainfall7dmm: 210, soilMoisturePct: 62, roads: ['Tawang–Bomdila Rd (BRO)', 'Sela Pass Rd'], infrastructure: ['Army logistics point', '1 hospital'], populationExposed: 12000 },
  { id: 'anini-dibang', state: 'Arunachal Pradesh', district: 'Dibang Valley', place: 'Anini', lat: 28.7969, lon: 95.9052, elevationM: 1980, slopeDeg: 40, soil: 'Gravelly-Loam', landCover: 'Dense forest', distRiverM: 300, histCount5y: 7, rainfall24mm: 92, rainfall7dmm: 268, soilMoisturePct: 70, roads: ['Anini–Roing Rd'], infrastructure: ['Hydel access rd'], populationExposed: 4500 },
  { id: 'noney', state: 'Manipur', district: 'Noney', place: 'Tupul / Noney', lat: 24.7800, lon: 93.5800, elevationM: 880, slopeDeg: 36, soil: 'Clayey / Shale', landCover: 'Excavated / Forest', distRiverM: 250, histCount5y: 11, rainfall24mm: 154, rainfall7dmm: 398, soilMoisturePct: 82, roads: ['NH-37 Imphal–Silchar', 'Railway construction face'], infrastructure: ['Railway yard (Tupul)', '2 villages'], populationExposed: 15000 },
  { id: 'churachandpur', state: 'Manipur', district: 'Churachandpur', place: 'Churachandpur', lat: 24.3333, lon: 93.6667, elevationM: 921, slopeDeg: 30, soil: 'Loam', landCover: 'Settlement / Forest', distRiverM: 700, histCount5y: 8, rainfall24mm: 96, rainfall7dmm: 274, soilMoisturePct: 66, roads: ['NH-102B', 'Churachandpur–Tipaimukh Rd'], infrastructure: ['1 hospital', '4 schools'], populationExposed: 22000 },
  { id: 'ukhrul', state: 'Manipur', district: 'Ukhrul', place: 'Ukhrul', lat: 25.1100, lon: 94.3600, elevationM: 2020, slopeDeg: 33, soil: 'Clay-Loam', landCover: 'Forest / Terrace', distRiverM: 800, histCount5y: 6, rainfall24mm: 74, rainfall7dmm: 226, soilMoisturePct: 60, roads: ['Ukhrul–Imphal Rd'], infrastructure: ['2 schools'], populationExposed: 9000 },
  { id: 'aizawl', state: 'Mizoram', district: 'Aizawl', place: 'Aizawl', lat: 23.7271, lon: 92.7176, elevationM: 1132, slopeDeg: 32, soil: 'Shale / Clayey', landCover: 'Dense urban on ridge', distRiverM: 1100, histCount5y: 17, rainfall24mm: 138, rainfall7dmm: 372, soilMoisturePct: 80, roads: ['NH-6 Aizawl–Silchar', 'Aizawl city ridge roads'], infrastructure: ['3 schools', '1 hospital', 'Power substation'], populationExposed: 55000 },
  { id: 'lunglei', state: 'Mizoram', district: 'Lunglei', place: 'Lunglei', lat: 22.8800, lon: 92.7300, elevationM: 722, slopeDeg: 31, soil: 'Clayey', landCover: 'Settlement / Forest', distRiverM: 650, histCount5y: 10, rainfall24mm: 112, rainfall7dmm: 318, soilMoisturePct: 72, roads: ['NH-54 Lunglei–Tlabung'], infrastructure: ['2 schools'], populationExposed: 18000 },
  { id: 'kohima', state: 'Nagaland', district: 'Kohima', place: 'Kohima', lat: 25.6751, lon: 94.1086, elevationM: 1444, slopeDeg: 29, soil: 'Loam / Shale', landCover: 'Urban / Forest', distRiverM: 950, histCount5y: 9, rainfall24mm: 88, rainfall7dmm: 252, soilMoisturePct: 64, roads: ['NH-29 Kohima–Dimapur', 'Kohima–Imphal Rd'], infrastructure: ['1 hospital', 'Govt complex'], populationExposed: 25000 },
  { id: 'mokokchung', state: 'Nagaland', district: 'Mokokchung', place: 'Mokokchung', lat: 26.3271, lon: 94.5246, elevationM: 1325, slopeDeg: 27, soil: 'Loam', landCover: 'Settlement / Terrace', distRiverM: 1000, histCount5y: 5, rainfall24mm: 62, rainfall7dmm: 198, soilMoisturePct: 58, roads: ['Mokokchung–Mariani Rd'], infrastructure: ['2 schools'], populationExposed: 11000 },
  { id: 'gangtok', state: 'Sikkim', district: 'Gangtok', place: 'Gangtok', lat: 27.3389, lon: 88.6065, elevationM: 1650, slopeDeg: 30, soil: 'Sandy-Loam', landCover: 'Urban hillside', distRiverM: 1200, histCount5y: 12, rainfall24mm: 118, rainfall7dmm: 332, soilMoisturePct: 74, roads: ['NH-10 Gangtok–Siliguri', 'Gangtok–Nathula Rd'], infrastructure: ['2 hospitals', 'NH-10 bridges'], populationExposed: 38000 },
  { id: 'lachen-nsikkim', state: 'Sikkim', district: 'Mangan (North Sikkim)', place: 'Lachen', lat: 27.7200, lon: 88.5500, elevationM: 2750, slopeDeg: 37, soil: 'Rocky / Glacial till', landCover: 'Alpine / GLOF-exposed', distRiverM: 200, histCount5y: 8, rainfall24mm: 84, rainfall7dmm: 244, soilMoisturePct: 68, roads: ['Lachen–Chungthang Rd'], infrastructure: ['Hydel intake', 'Army post'], populationExposed: 6000 },
  { id: 'namchi', state: 'Sikkim', district: 'Namchi (South Sikkim)', place: 'Namchi', lat: 27.1648, lon: 88.3630, elevationM: 1315, slopeDeg: 26, soil: 'Loam', landCover: 'Terrace / Settlement', distRiverM: 850, histCount5y: 4, rainfall24mm: 54, rainfall7dmm: 172, soilMoisturePct: 55, roads: ['Namchi–Jorethang Rd'], infrastructure: ['1 school'], populationExposed: 8000 },
  { id: 'guwahati', state: 'Assam', district: 'Kamrup Metro', place: 'Guwahati (hills)', lat: 26.1445, lon: 91.7362, elevationM: 120, slopeDeg: 22, soil: 'Alluvial / Hill-cut', landCover: 'Urban hillocks', distRiverM: 500, histCount5y: 13, rainfall24mm: 104, rainfall7dmm: 296, soilMoisturePct: 69, roads: ['NH-27 city bypass', 'Guwahati hill roads'], infrastructure: ['5 hillside settlements', 'Power lines'], populationExposed: 48000 },
  { id: 'nongstoin', state: 'Meghalaya', district: 'West Khasi Hills', place: 'Nongstoin', lat: 25.5167, lon: 91.2667, elevationM: 1409, slopeDeg: 25, soil: 'Lateritic', landCover: 'Forest / Village', distRiverM: 750, histCount5y: 6, rainfall24mm: 122, rainfall7dmm: 340, soilMoisturePct: 71, roads: ['Nongstoin–Shillong Rd'], infrastructure: ['2 schools'], populationExposed: 14000 },
  { id: 'agartala-fringe', state: 'Tripura', district: 'West Tripura', place: 'Agartala fringe (Baramura)', lat: 23.8400, lon: 91.2800, elevationM: 180, slopeDeg: 16, soil: 'Alluvial / Sandstone', landCover: 'Plains / Low hills', distRiverM: 600, histCount5y: 2, rainfall24mm: 48, rainfall7dmm: 158, soilMoisturePct: 52, roads: ['NH-8 Agartala–Ambasa'], infrastructure: ['1 school'], populationExposed: 9000 },
  { id: 'bomdila', state: 'Arunachal Pradesh', district: 'West Kameng', place: 'Bomdila', lat: 27.2643, lon: 92.4158, elevationM: 2415, slopeDeg: 35, soil: 'Rocky-Loam', landCover: 'Forest / Road-cut', distRiverM: 550, histCount5y: 7, rainfall24mm: 78, rainfall7dmm: 232, soilMoisturePct: 63, roads: ['BCT Rd (Balipara–Tawang)'], infrastructure: ['BRO camp'], populationExposed: 7000 },
];

export const HISTORICAL_AVG_RAINFALL_24 = 82; // mm, illustrative NER monsoon baseline (SIMULATED)
