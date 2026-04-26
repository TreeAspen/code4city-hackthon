// Sanitation_set bucket definitions — shared across Dashboard, AnalyticsSidebar,
// and DensityMap. Source: src/asset/311_2025_sanitation_filtering.ipynb.

import { MainCategory } from './types';

export type BucketLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export const BUCKET_TITLES: Record<BucketLetter, string> = {
  A: 'A · Trash, Collection & Sweeping',
  B: 'B · Sewer & Wastewater',
  C: 'C · Flooding, Drainage & Streets',
  D: 'D · Hygiene & Pests',
  E: 'E · Blockage & Environment',
};

// Recharts-friendly fixed color per bucket so all charts agree.
export const BUCKET_COLORS: Record<BucketLetter, string> = {
  A: '#FFE300', // signature yellow — biggest bucket (trash)
  B: '#0EA5E9', // sewer/water — sky blue
  C: '#6366F1', // flooding/streets — indigo
  D: '#EF4444', // hygiene/pests — red
  E: '#10B981', // blockage/environment — green
};

const BUCKET_TYPES: Record<BucketLetter, string[]> = {
  A: [
    'Dirty Condition',
    'Missed Collection',
    'Litter Basket Complaint',
    'Litter Basket Request',
    'Recycling Basket Complaint',
    'Residential Disposal Complaint',
    'Commercial Disposal Complaint',
    'Institution Disposal Complaint',
    'Dumpster Complaint',
    'Illegal Dumping',
    'Street Sweeping Complaint',
    'Sanitation Worker or Vehicle Complaint',
    'Transfer Station Complaint',
    'DSNY Internal',
  ],
  B: [
    'Sewer',
    'Root/Sewer/Sidewalk Condition',
    'Indoor Sewage',
    'Industrial Waste',
    'WATER LEAK',
    'Water System',
  ],
  C: [
    'Standing Water',
    'Water Conservation',
    'Water Quality',
    'Curb Condition',
    'Street Condition',
    'Highway Condition',
    'DEP Street Condition',
    'DEP Sidewalk Condition',
    'DEP Highway Condition',
    'Sidewalk Condition',
  ],
  D: [
    'Rodent',
    'Mosquitoes',
    'Dead Animal',
    'UNSANITARY CONDITION',
    'Public Toilet',
    'Urinating in Public',
    'Unsanitary Pigeon Condition',
    'Unsanitary Animal Pvt Property',
    'Unsanitary Animal Facility',
  ],
  E: [
    'Overgrown Tree/Branches',
    'Wood Pile Remaining',
    'Lot Condition',
    'Obstruction',
    'Abandoned Vehicle',
    'Derelict Vehicles',
  ],
};

export const BUCKET_LETTERS: BucketLetter[] = ['A', 'B', 'C', 'D', 'E'];

// Reverse lookup: complaintType → bucket letter
export const TYPE_TO_BUCKET: Record<string, BucketLetter> = (() => {
  const m: Record<string, BucketLetter> = {};
  for (const letter of BUCKET_LETTERS) {
    for (const t of BUCKET_TYPES[letter]) m[t] = letter;
  }
  return m;
})();

const idize = (letter: BucketLetter, name: string) =>
  `${letter.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export const BUCKETS: Record<BucketLetter, MainCategory> = {
  A: {
    id: 'bucket-a',
    title: BUCKET_TITLES.A,
    color: 'bg-white border-gray-200',
    subCategories: BUCKET_TYPES.A.map(name => ({ id: idize('A', name), name })),
  },
  B: {
    id: 'bucket-b',
    title: BUCKET_TITLES.B,
    color: 'bg-white border-gray-200',
    subCategories: BUCKET_TYPES.B.map(name => ({ id: idize('B', name), name })),
  },
  C: {
    id: 'bucket-c',
    title: BUCKET_TITLES.C,
    color: 'bg-white border-gray-200',
    subCategories: BUCKET_TYPES.C.map(name => ({ id: idize('C', name), name })),
  },
  D: {
    id: 'bucket-d',
    title: BUCKET_TITLES.D,
    color: 'bg-white border-gray-200',
    subCategories: BUCKET_TYPES.D.map(name => ({ id: idize('D', name), name })),
  },
  E: {
    id: 'bucket-e',
    title: BUCKET_TITLES.E,
    color: 'bg-white border-gray-200',
    subCategories: BUCKET_TYPES.E.map(name => ({ id: idize('E', name), name })),
  },
};

export function buildCategoriesForQuery(query: string): MainCategory[] {
  const q = query.toLowerCase();
  const wants = {
    A: /\b(trash|garbage|litter|basket|sweep|sweeping|dump|dumping|missed|collection|recycl|disposal|dsny|sanitation worker|transfer station)\b/.test(q),
    B: /\b(sewer|sewage|wastewater|water leak|water system|industrial waste|root)\b/.test(q),
    C: /\b(flood|flooding|drain|drainage|standing water|street condition|sidewalk|highway|curb|water quality|water conservation|pothole)\b/.test(q),
    D: /\b(hygiene|pest|rodent|rat|mosquito|dead animal|unsanitary|public toilet|urinat|pigeon|animal)\b/.test(q),
    E: /\b(block|blockage|obstruct|abandoned|derelict|tree|branch|wood|lot)\b/.test(q),
  } as Record<BucketLetter, boolean>;
  const anyMatch = Object.values(wants).some(Boolean);
  const useAll = !anyMatch;
  const main: MainCategory[] = [];
  for (const letter of BUCKET_LETTERS) {
    if (useAll || wants[letter]) main.push(BUCKETS[letter]);
  }
  const allChosen = new Set(main.flatMap(c => c.subCategories.map(s => s.id)));
  const excluded: MainCategory = {
    id: 'excluded',
    title: 'Excluded (Irrelevant)',
    color: 'bg-gray-100 border-gray-200',
    subCategories: BUCKET_LETTERS
      .flatMap(l => BUCKETS[l].subCategories)
      .filter(s => !allChosen.has(s.id)),
  };
  main.push(excluded);
  return main;
}
