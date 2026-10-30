// Address → coordinates via MapTiler, called from the browser. The key is a
// public one restricted to this site's domains in the MapTiler dashboard.
// Addresses are looked up once (on save) and stored on the `people` row.

const KEY = import.meta.env.PUBLIC_MAPTILER_KEY as string | undefined;

export const hasMapKey = !!KEY;

export function mapStyleUrl() {
  return `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${KEY}`;
}

export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const q = address.trim();
  if (!KEY || !q) return null;
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${KEY}&country=au&proximity=ip&limit=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const center = json.features?.[0]?.center;
    if (!Array.isArray(center)) return null;
    return { lng: center[0], lat: center[1] };
  } catch {
    return null;
  }
}
