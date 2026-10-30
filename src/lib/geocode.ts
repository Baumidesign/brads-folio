// Address → coordinates via MapTiler, called from the browser. The key is a
// public one restricted to this site's domains in the MapTiler dashboard.
// Addresses are looked up once (on save) and stored on the `people` row.

const KEY = import.meta.env.PUBLIC_MAPTILER_KEY as string | undefined;

export const hasMapKey = !!KEY;

export function mapStyleUrl() {
  return `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${KEY}`;
}

// Results are ranked by distance from where the user is (their phone's GPS,
// only if they've already allowed location for this site) or, failing that,
// Adelaide. The earlier IP-based guess put Adelaide addresses in Melbourne.
const ADELAIDE = '138.6007,-34.9285';
const MIN_RELEVANCE = 0.5;

async function proximity(): Promise<string> {
  try {
    const perm = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
    if (perm?.state !== 'granted') return ADELAIDE; // never trigger a permission prompt here
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000, maximumAge: 10 * 60 * 1000 })
    );
    return `${pos.coords.longitude},${pos.coords.latitude}`;
  } catch {
    return ADELAIDE;
  }
}

// `area` is the person's suburb (stored separately from the street address).
// `near` ("lng,lat") skips the location check, e.g. for a batch of lookups.
export async function geocode(address: string, area?: string | null, near?: string): Promise<{ lat: number; lng: number } | null> {
  // Drop a unit prefix ("3/12 Smith St" → "12 Smith St"); any other slash
  // breaks the lookup URL, so turn it into a space.
  const street = address.trim().replace(/^[\w-]+\s*\/\s*(?=\d)/, '').replace(/\//g, ' ');
  const suburb = (area ?? '').trim();
  if (!KEY || !street) return null;
  const q = suburb && !street.toLowerCase().includes(suburb.toLowerCase())
    ? `${street}, ${suburb}`
    : street;
  try {
    const around = near ?? await proximity();
    // With no suburb, a street name alone matches the same street in other
    // cities, so only search ~100 km around `around`. With a suburb, search
    // all of Australia (e.g. adding a Melbourne contact from Adelaide).
    const [lng, lat] = around.split(',').map(Number);
    const bbox = suburb ? '' : `&bbox=${lng - 1.2},${lat - 0.9},${lng + 1.2},${lat + 0.9}`;
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${KEY}` +
      `&country=au&proximity=${around}${bbox}&types=address,street&limit=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const best = json.features?.[0];
    // Weak matches are usually a same-named street somewhere else; better no
    // pin (the user can add the suburb) than a confidently wrong one.
    if (!best || (best.relevance ?? 0) < MIN_RELEVANCE) return null;
    const center = best.center;
    if (!Array.isArray(center)) return null;
    return { lng: center[0], lat: center[1] };
  } catch {
    return null;
  }
}

export { proximity as lookupNear };

// Spot on the map → nearest street address and suburb, for "Add here" /
// "Move pin". The caller keeps the exact spot as the pin; this only suggests
// the address text, which can be a house number or two off.
export async function reverseGeocode(lng: number, lat: number): Promise<{ address: string; area: string } | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${KEY}&types=address,street&limit=1`
    );
    if (!res.ok) return null;
    const f = (await res.json()).features?.[0];
    if (!f?.text) return null;
    const ctx: { id?: string; text?: string }[] = f.context ?? [];
    const suburb = ['municipality', 'neighbourhood', 'place']
      .map(type => ctx.find(c => c.id?.startsWith(type + '.'))?.text)
      .find(Boolean) ?? '';
    return { address: f.address ? `${f.address} ${f.text}` : f.text, area: suburb };
  } catch {
    return null;
  }
}
