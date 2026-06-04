export const T = {
  bg:      '#000000',
  card:    '#1A1A1C',
  cardHi:  '#232325',
  control: '#2C2C2E',
  line:    'rgba(255,255,255,0.08)',
  blue:    '#2F6BFF',
  blueDim: 'rgba(47,107,255,0.16)',
  white:   '#FFFFFF',
  text2:   '#8E8E93',
  text3:   '#636366',
  red:     '#FF453A',
  green:   '#30D158',
  orange:  '#FF9F0A',
  amber:   '#FFD60A',
  font:    '-apple-system, "SF Pro Text", system-ui, sans-serif',
} as const;

export const INTEREST: Record<number, { label: string; short: string; tempColor: string }> = {
  5: { label: 'Very interested', short: 'Very',     tempColor: '#FF453A' },
  4: { label: 'Interested',      short: 'Keen',     tempColor: '#FF453A' },
  3: { label: 'Curious',         short: 'Curious',  tempColor: '#FF9F0A' },
  2: { label: 'Lukewarm',        short: 'Lukewarm', tempColor: '#2F6BFF' },
  1: { label: 'Not now',         short: 'Not now',  tempColor: '#2F6BFF' },
};

export function initials(name: string): string {
  const clean = name
    .replace(/\(.*?\)/g, '')
    .replace(/&.*$/, '')
    .replace(/family/i, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  const days = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (days <= 0)  return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)   return `${days} days ago`;
  if (days < 14)  return 'last week';
  if (days < 60)  return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}
