// Community-district codes, derived from the same GeoJSON the map draws, so the
// map and the checkbox list can never disagree about what exists.

import districtsGeo from '../asset/community-districts.geo.json';

export const BORO_PREFIX: Record<number, string> = {
  1: 'MN',
  2: 'BX',
  3: 'BK',
  4: 'QN',
  5: 'SI',
};

export const BOROUGH_NAMES: Record<string, string> = {
  MN: 'Manhattan',
  BX: 'Bronx',
  BK: 'Brooklyn',
  QN: 'Queens',
  SI: 'Staten Island',
};

export const BOROUGH_ORDER = ['MN', 'BX', 'BK', 'QN', 'SI'] as const;

export const cdCodeToBoard = (boroCD: number): string => {
  const boro = Math.floor(boroCD / 100);
  const cd = boroCD % 100;
  const prefix = BORO_PREFIX[boro] ?? 'XX';
  return `${prefix}-${String(cd).padStart(2, '0')}`;
};

// NYC has 59 community districts. The GeoJSON also carries "joint interest
// areas" — parks, airports, Rikers — numbered above each borough's real count
// (MN-64 Central Park, BX-26/27/28, BK-55/56, QN-80…84, SI-95). Nobody lives
// there and no 311 complaint is filed against them, so they don't belong in a
// picker. MapSelector shares this predicate so the map and list agree.
const REAL_DISTRICT_COUNT: Record<number, number> = { 1: 12, 2: 12, 3: 18, 4: 14, 5: 3 };

export const isRealDistrict = (boroCD: number): boolean => {
  const boro = Math.floor(boroCD / 100);
  const cd = boroCD % 100;
  return cd >= 1 && cd <= (REAL_DISTRICT_COUNT[boro] ?? 0);
};

const allCodes = (districtsGeo as { features: { properties: { BoroCD: number } }[] }).features
  .map(f => f.properties.BoroCD)
  .filter(isRealDistrict)
  .map(cdCodeToBoard);

// { MN: ['MN-01', …], BX: [...], … } — boroughs in the conventional order.
export const DISTRICTS_BY_BOROUGH: { prefix: string; name: string; codes: string[] }[] =
  BOROUGH_ORDER.map(prefix => ({
    prefix,
    name: BOROUGH_NAMES[prefix],
    codes: [...new Set(allCodes.filter(c => c.startsWith(`${prefix}-`)))].sort(),
  })).filter(g => g.codes.length > 0);

export const ALL_DISTRICT_CODES = DISTRICTS_BY_BOROUGH.flatMap(g => g.codes);
