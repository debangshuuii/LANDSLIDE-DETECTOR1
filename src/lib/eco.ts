import type { Lang } from './i18n';
import { t } from './i18n';
import { ecoOf } from '../data/eco';
import type { NerZone } from '../data/nerDistricts';

// Traditional Ecological Knowledge precursors for 1-tap field reporting.
export const TEK_OPTIONS = ['tekMuddy', 'tekSpring', 'tekTrees', 'tekCracks'] as const;
export type TekKey = (typeof TEK_OPTIONS)[number];

export interface NbsItem { name: string; whyKey: string }

// Bio-engineering prescription from soil + elevation (demo rules).
export function nbsFor(zone: NerZone): NbsItem[] {
  const out: NbsItem[] = [{ name: 'Vetiver grass (Chrysopogon zizanioides)', whyKey: 'nbsVetiver' }];
  if (/shale|clay/i.test(zone.soil) || zone.distRiverM <= 600) {
    out.push({ name: 'Native bamboo (Dendrocalamus hamiltonii)', whyKey: 'nbsBamboo' });
  }
  if (zone.elevationM < 1600) {
    out.push({ name: 'Live staking & brush layering', whyKey: 'nbsBrush' });
  } else {
    out.push({ name: 'Alpine sod + drainage de-silting', whyKey: 'nbsAlpine' });
  }
  return out;
}

export function glofNote(zoneId: string, lang: Lang): string | null {
  if (!ecoOf(zoneId).glacial) return null;
  return t(lang, 'glofWatch');
}

// Short eco-mitigation directives for the bulletin (translated headers live in i18n).
export function ecoDirectives(lang: Lang, severePlaces: string[]): { to: string; points: string[] }[] {
  const lead = severePlaces.slice(0, 4).join(', ') || '—';
  return [
    { to: t(lang, 'ecoDirBio'), points: [t(lang, 'ecoDirBioP').replace('{v}', lead)] },
    { to: t(lang, 'ecoDirDrain'), points: [t(lang, 'ecoDirDrainP')] },
    { to: t(lang, 'ecoDirCut'), points: [t(lang, 'ecoDirCutP')] },
  ];
}
