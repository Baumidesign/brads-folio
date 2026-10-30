import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { usePeople } from './usePeople';
import { T, INTEREST, initials } from './tokens';
import { Avatar, Dots, PinGlyph } from './atoms';
import { PersonSheet } from './PersonSheet';
import { geocode, hasMapKey, lookupNear, mapStyleUrl, reverseGeocode } from '../../lib/geocode';
import type { Person } from './types';

// MapLibre finds its worker relative to its own file, which breaks once
// bundled, so point it at the copy Vite emits.
maplibregl.setWorkerUrl(workerUrl);

const ADELAIDE: [number, number] = [138.6007, -34.9285];
const NAV_HEIGHT = 102; // BottomNav: 84px + 18px bottom padding

// Teardrop pin from the design handoff: coloured by interest, initials inside,
// bigger with a glow for interest >= 4.
function pinElement(p: Person, selected: boolean) {
  const color = INTEREST[p.interest]?.tempColor ?? T.blue;
  const big = p.interest >= 4;
  const size = selected ? 46 : big ? 40 : 34;

  const outer = document.createElement('div');
  outer.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;` +
    (selected ? 'filter:drop-shadow(0 6px 14px rgba(0,0,0,.6));' : '');

  const drop = document.createElement('div');
  drop.style.cssText = `width:100%;height:100%;box-sizing:border-box;border-radius:50% 50% 50% 0;` +
    `transform:rotate(-45deg);background:${color};border:2.5px solid rgba(255,255,255,0.9);` +
    `box-shadow:0 3px 8px rgba(0,0,0,0.45)${big ? `, 0 0 14px ${color}99` : ''};` +
    `display:flex;align-items:center;justify-content:center;`;

  const label = document.createElement('span');
  label.textContent = initials(p.name);
  label.style.cssText = `transform:rotate(45deg);font-family:${T.font};font-weight:700;` +
    `font-size:${Math.round(size * 0.32)}px;color:#fff;`;

  drop.append(label);
  outer.append(drop);
  // The rotated tip sits ~0.207 × size below the box; lift it onto the point.
  return { el: outer, offset: [0, -Math.round(size * 0.207)] as [number, number] };
}

export function MapScreen() {
  const { session, db, loading, loadError, people, setPeople, upsertPerson, removePerson } = usePeople();
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{
    person: Person | null;
    isNew: boolean;
    prefill?: { address: string; area: string; lat: number; lng: number };
  } | null>(null);
  // Crosshair mode: drag the map under a fixed pin, then "Use this spot".
  const [placing, setPlacing] = useState<{ mode: 'new' } | { mode: 'move'; person: Person } | null>(null);
  const [placingBusy, setPlacingBusy] = useState(false);
  // After "Move pin": ask whether to also take the suggested address.
  const [moveConfirm, setMoveConfirm] = useState<{
    person: Person; lat: number; lng: number; address: string; area: string;
  } | null>(null);
  const [locating, setLocating] = useState<{ done: number; total: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fittedRef = useRef(false);

  const pinned = people.filter(p => p.lat != null && p.lng != null);
  const unpinned = people.filter(p => (p.lat == null || p.lng == null) && p.address?.trim());
  const selected = people.find(p => p.id === selectedId) ?? null;

  // Create the map once.
  useEffect(() => {
    if (!hasMapKey || !containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleUrl(),
      center: ADELAIDE,
      zoom: 11,
      attributionControl: { compact: true },
    });
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'bottom-left'
    );
    map.on('click', () => setSelectedId(null));
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Draw the pins whenever people or the selection change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = pinned
      // selected and high-interest pins last, so they draw on top
      .sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId) || a.interest - b.interest)
      .map(p => {
        const { el, offset } = pinElement(p, p.id === selectedId);
        el.addEventListener('click', e => { e.stopPropagation(); setSelectedId(p.id); });
        return new maplibregl.Marker({ element: el, anchor: 'bottom', offset })
          .setLngLat([p.lng!, p.lat!])
          .addTo(map);
      });

    // Frame all pins once, on first load.
    if (!fittedRef.current && !loading && pinned.length) {
      fittedRef.current = true;
      fitTo(pinned.map(p => [p.lng!, p.lat!]), false);
    }
  }, [people, selectedId, loading]);

  function fitTo(points: [number, number][], animate: boolean) {
    const map = mapRef.current;
    if (!map || !points.length) return;
    const bounds = new maplibregl.LngLatBounds();
    points.forEach(pt => bounds.extend(pt));
    map.fitBounds(bounds, { padding: { top: 140, bottom: 200, left: 50, right: 50 }, maxZoom: 15, duration: animate ? 600 : 0 });
  }

  const showNotice = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 5000); };

  // Look up every contact that has an address but no location yet.
  const locateAll = async () => {
    if (!db) return;
    const todo = unpinned;
    setLocating({ done: 0, total: todo.length });
    let found = 0;
    const points: [number, number][] = pinned.map(p => [p.lng!, p.lat!]);
    const near = await lookupNear(); // once for the whole batch
    for (const [i, p] of todo.entries()) {
      const c = await geocode(p.address, p.area, near);
      if (c) {
        const { error } = await db.from('people').update(c).eq('id', p.id);
        if (!error) {
          found++;
          points.push([c.lng, c.lat]);
          setPeople(ps => ps.map(x => x.id === p.id ? { ...x, ...c } : x));
        }
      }
      setLocating({ done: i + 1, total: todo.length });
    }
    setLocating(null);
    fitTo(points, true);
    if (found < todo.length) {
      showNotice(`${todo.length - found} address${todo.length - found === 1 ? '' : 'es'} couldn't be found. Edit them in Visits to try again.`);
    }
  };

  // --- Add here / Move pin ---
  const startPlacing = (mode: { mode: 'new' } | { mode: 'move'; person: Person }) => {
    const map = mapRef.current;
    if (!map) return;
    setSelectedId(null);
    setPlacing(mode);
    if (mode.mode === 'move' && mode.person.lat != null && mode.person.lng != null) {
      map.easeTo({ center: [mode.person.lng, mode.person.lat], zoom: Math.max(map.getZoom(), 17) });
      return;
    }
    // Start on where the user is standing (asks for location the first time).
    navigator.geolocation?.getCurrentPosition(
      pos => map.easeTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 18 }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60 * 1000 }
    );
  };

  const confirmSpot = async () => {
    const map = mapRef.current;
    if (!map || !placing) return;
    const { lng, lat } = map.getCenter();
    setPlacingBusy(true);
    const found = await reverseGeocode(lng, lat);
    setPlacingBusy(false);
    const mode = placing;
    setPlacing(null);
    const address = found?.address ?? '';
    const area = found?.area ?? '';
    if (mode.mode === 'new') {
      setSheet({ person: null, isNew: true, prefill: { address, area, lat, lng } });
    } else {
      setMoveConfirm({ person: mode.person, lat, lng, address, area });
    }
  };

  const saveMove = async (useNewAddress: boolean) => {
    if (!db || !moveConfirm) return;
    const { person, lat, lng, address, area } = moveConfirm;
    const changes = useNewAddress && address ? { lat, lng, address, area } : { lat, lng };
    setMoveConfirm(null);
    const { error } = await db.from('people').update(changes).eq('id', person.id);
    if (error) {
      showNotice(`Couldn't move the pin: ${error.message}`);
      return;
    }
    setPeople(ps => ps.map(x => x.id === person.id ? { ...x, ...changes } : x));
    setSelectedId(person.id);
  };

  const handleSave = (saved: Person) => {
    upsertPerson(saved);
    setSheet(null);
    if (saved.lat != null && saved.lng != null) {
      setSelectedId(saved.id);
      mapRef.current?.easeTo({ center: [saved.lng, saved.lat], zoom: Math.max(mapRef.current.getZoom(), 14) });
    } else if (saved.address?.trim()) {
      showNotice("Saved, but that address couldn't be found on the map.");
    }
  };

  const handleDelete = (id: string) => {
    removePerson(id);
    setSelectedId(null);
    setSheet(null);
  };

  const subtitle = loading
    ? 'Loading…'
    : `${pinned.length} on the map · pins coloured by interest`;

  return (
    <div style={{ position: 'fixed', inset: `0 0 ${NAV_HEIGHT}px 0`, background: '#0C0C0E', fontFamily: T.font }}>
      {/* map canvas */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {!hasMapKey && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: T.text2, fontSize: 15 }}>
          The map isn't connected yet. It needs a MapTiler key (PUBLIC_MAPTILER_KEY).
        </div>
      )}

      {/* title */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 140, zIndex: 40, pointerEvents: 'none' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, margin: 0, letterSpacing: 0.3, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Map</h1>
        <div style={{ fontSize: 14, color: '#C5C5CA', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{subtitle}</div>
      </div>

      {/* legend */}
      <div style={{ position: 'absolute', right: 14, top: 16, zIndex: 40, background: 'rgba(20,20,22,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 12px', border: '1px solid ' + T.line }}>
        {[{ c: T.red, l: 'High' }, { c: T.orange, l: 'Medium' }, { c: T.blue, l: 'Low' }].map(x => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <span style={{ width: 11, height: 11, borderRadius: 11, background: x.c }} />
            <span style={{ fontSize: 12.5, color: '#C5C5CA' }}>{x.l}</span>
          </div>
        ))}
      </div>

      {/* contacts without a location */}
      {hasMapKey && !loading && !loadError && unpinned.length > 0 && !selected && !placing && !moveConfirm && (
        <button
          type="button"
          onClick={locateAll}
          disabled={!!locating}
          style={{
            position: 'absolute', left: 14, right: 90, top: 96, zIndex: 40,
            background: 'rgba(20,20,22,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid ' + T.line, borderRadius: 14, padding: '10px 12px',
            color: T.white, fontFamily: T.font, fontSize: 13.5, textAlign: 'left', cursor: 'pointer',
          }}
        >
          {locating
            ? `Finding locations… ${locating.done}/${locating.total}`
            : <>{unpinned.length} contact{unpinned.length === 1 ? '' : 's'} not on the map · <span style={{ color: T.blue, fontWeight: 600 }}>Find them</span></>}
        </button>
      )}

      {(loadError || notice) && (
        <div style={{ position: 'absolute', left: 14, right: 14, top: 96, zIndex: 45, background: T.card, border: '1px solid ' + T.line, borderRadius: 14, padding: '10px 12px', color: T.text2, fontSize: 13.5 }}>
          {loadError ?? notice}
        </div>
      )}

      {/* selected person card */}
      {selected && !sheet && !placing && !moveConfirm && (
        <div
          onClick={() => setSheet({ person: selected, isNew: false })}
          style={{
            position: 'absolute', left: 14, right: 14, bottom: 112, zIndex: 50, cursor: 'pointer',
            background: T.card, borderRadius: 18, padding: 14, border: '1px solid ' + T.line,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', gap: 13, alignItems: 'center',
          }}
        >
          <Avatar name={selected.name} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 600, color: T.white }}>{selected.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <PinGlyph />
              <span style={{ fontSize: 13, color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.address}</span>
            </div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <Dots value={selected.interest} />
            {/* Opens the Google Maps app on iPhone if installed, otherwise the website */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.address?.trim() ? [selected.address.trim(), selected.area?.trim(), 'SA'].filter(Boolean).join(', ') : `${selected.lat},${selected.lng}`)}`}
              target="_blank"
              rel="noopener"
              onClick={e => e.stopPropagation()}
              style={{
                background: T.blue, color: '#fff', textDecoration: 'none',
                fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
              }}
            >
              Directions
            </a>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); startPlacing({ mode: 'move', person: selected }); }}
              style={{
                background: T.control, color: T.white, border: 'none', cursor: 'pointer',
                fontFamily: T.font, fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
              }}
            >
              Move pin
            </button>
          </div>
        </div>
      )}

      {/* add person */}
      {!sheet && session && !placing && !moveConfirm && (
        <button
          onClick={() => setSheet({ person: null, isNew: true })}
          style={{
            position: 'absolute', right: 20, bottom: 40, zIndex: 60, // clear of the map credits
            width: 60, height: 60, borderRadius: 60,
            background: T.blue, border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 30, fontWeight: 300,
            boxShadow: `0 6px 20px ${T.blue}88, 0 2px 8px rgba(0,0,0,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          }}
        >
          +
        </button>
      )}

      {/* Add here: place a new person by dragging the map under a crosshair */}
      {hasMapKey && !sheet && session && !placing && !moveConfirm && !selected && (
        <button
          type="button"
          onClick={() => startPlacing({ mode: 'new' })}
          style={{
            position: 'absolute', right: 92, bottom: 50, zIndex: 60,
            background: 'rgba(20,20,22,0.92)', border: '1px solid ' + T.line, borderRadius: 999,
            color: T.white, fontFamily: T.font, fontSize: 14, fontWeight: 600,
            padding: '11px 16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          📍 Add here
        </button>
      )}

      {placing && (
        <>
          {/* the pin's tip marks the map centre */}
          <svg
            width="36" height="48" viewBox="0 0 36 48"
            style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-18px, -48px)', zIndex: 45, pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
          >
            <path d="M18 1C8.6 1 1 8.6 1 18c0 12.5 17 29 17 29s17-16.5 17-29C35 8.6 27.4 1 18 1z" fill={T.blue} stroke="#fff" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="5.5" fill="#fff" />
          </svg>
          <div style={{ position: 'absolute', left: 14, right: 14, top: 96, zIndex: 45, background: T.card, border: '1px solid ' + T.line, borderRadius: 14, padding: '10px 12px', color: T.white, fontSize: 14 }}>
            {placing.mode === 'move' ? `Move the map so the pin sits on ${placing.person.name}'s house.` : 'Move the map so the pin sits on the house.'}
          </div>
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 40, zIndex: 60, display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setPlacing(null)}
              style={{ flex: 1, padding: '15px 0', borderRadius: 14, border: 'none', background: T.control, color: T.white, fontFamily: T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSpot}
              disabled={placingBusy}
              style={{ flex: 2, padding: '15px 0', borderRadius: 14, border: 'none', background: T.blue, color: '#fff', fontFamily: T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: placingBusy ? 0.6 : 1 }}
            >
              {placingBusy ? 'Finding address…' : 'Use this spot'}
            </button>
          </div>
        </>
      )}

      {moveConfirm && (
        <div style={{
          position: 'absolute', left: 14, right: 14, bottom: 40, zIndex: 60,
          background: T.card, borderRadius: 18, padding: 16, border: '1px solid ' + T.line,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Move {moveConfirm.person.name}'s pin here?</div>
          {moveConfirm.address ? (
            <div style={{ fontSize: 13.5, color: T.text2, marginTop: 6, lineHeight: 1.4 }}>
              Nearest address: <span style={{ color: T.white }}>{[moveConfirm.address, moveConfirm.area].filter(Boolean).join(', ')}</span>
              <br />Saved: {[moveConfirm.person.address, moveConfirm.person.area].filter(Boolean).join(', ') || 'none'}
            </div>
          ) : (
            <div style={{ fontSize: 13.5, color: T.text2, marginTop: 6 }}>No address found here; their saved address stays as it is.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {moveConfirm.address && (
              <button type="button" onClick={() => saveMove(true)}
                style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: T.blue, color: '#fff', fontFamily: T.font, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Move pin & use this address
              </button>
            )}
            <button type="button" onClick={() => saveMove(false)}
              style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: moveConfirm.address ? T.control : T.blue, color: '#fff', fontFamily: T.font, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {moveConfirm.address ? 'Move pin, keep saved address' : 'Move pin'}
            </button>
            <button type="button" onClick={() => setMoveConfirm(null)}
              style={{ padding: '10px 0', border: 'none', background: 'none', color: T.text2, fontFamily: T.font, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {sheet && session && (
        <PersonSheet
          person={sheet.person}
          isNew={sheet.isNew}
          userId={session.userId}
          accessToken={session.accessToken}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
          prefill={sheet.prefill}
        />
      )}
    </div>
  );
}
