import { Incident311 } from '../types';

const SODA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

interface SodaRecord {
  unique_key?: string;
  created_date?: string;
  complaint_type?: string;
  descriptor?: string;
  borough?: string;
  community_board?: string;
  status?: string;
  incident_address?: string;
  location_type?: string;
  latitude?: string;
  longitude?: string;
}

export interface FetchIncidentsOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  limit?: number;
  boroughs?: string[];
}

const COMMUNITY_BOARD_PREFIX: Record<string, string> = {
  MANHATTAN: 'MN',
  BRONX: 'BX',
  BROOKLYN: 'BK',
  QUEENS: 'QN',
  'STATEN ISLAND': 'SI',
};

// SODA returns "01 MANHATTAN" — normalize to the "MN-01" shape the dashboard uses.
const normalizeCommunityBoard = (raw: string | undefined): string => {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2})\s+(.+)$/);
  if (!match) return '';
  const num = match[1].padStart(2, '0');
  const prefix = COMMUNITY_BOARD_PREFIX[match[2].trim()];
  return prefix ? `${prefix}-${num}` : '';
};

const toIncident = (r: SodaRecord): Incident311 => {
  const lat = r.latitude ? Number(r.latitude) : undefined;
  const lon = r.longitude ? Number(r.longitude) : undefined;
  return {
    id: r.unique_key ?? '',
    createdDate: r.created_date ?? '',
    complaintType: r.complaint_type ?? '',
    descriptor: r.descriptor ?? '',
    borough: (r.borough ?? '').trim(),
    communityBoard: normalizeCommunityBoard(r.community_board),
    status: r.status ?? '',
    location: r.incident_address ?? r.location_type ?? '',
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lon) ? lon : undefined,
  };
};

export const fetchIncidents = async (opts: FetchIncidentsOptions): Promise<Incident311[]> => {
  const { startDate, endDate, limit = 5000, boroughs } = opts;

  const where: string[] = [
    `created_date >= '${startDate}T00:00:00'`,
    `created_date <= '${endDate}T23:59:59'`,
    'latitude IS NOT NULL',
    'longitude IS NOT NULL',
  ];
  if (boroughs && boroughs.length > 0) {
    const list = boroughs.map(b => `'${b.toUpperCase().replace(/'/g, "''")}'`).join(',');
    where.push(`borough in (${list})`);
  }

  const params = new URLSearchParams({
    $select: 'unique_key,created_date,complaint_type,descriptor,borough,community_board,status,incident_address,location_type,latitude,longitude',
    $where: where.join(' AND '),
    $order: 'created_date DESC',
    $limit: String(limit),
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = import.meta.env.VITE_SODA_APP_TOKEN;
  if (token) headers['X-App-Token'] = token;

  const res = await fetch(`${SODA_ENDPOINT}?${params.toString()}`, { headers });
  if (!res.ok) {
    throw new Error(`311 API request failed: ${res.status} ${res.statusText}`);
  }
  const rows: SodaRecord[] = await res.json();
  return rows.map(toIncident).filter(i => i.id && i.createdDate);
};

// Returns [startDate, endDate] strings covering the most recent N days, ending today.
export const recentDateRange = (days: number): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
};
