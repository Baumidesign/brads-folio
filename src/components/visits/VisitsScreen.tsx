import { useState } from 'react';
import { T } from './tokens';
import { PersonCard } from './PersonCard';
import { PersonSheet } from './PersonSheet';
import type { Person } from './types';

interface SheetState {
  person: Person | null;
  isNew: boolean;
}

interface VisitsScreenProps {
  people: Person[];
  userId: string;
  accessToken: string;
}

export function VisitsScreen({ people: initial, userId, accessToken }: VisitsScreenProps) {
  const [people, setPeople] = useState<Person[]>(initial);
  const [query, setQuery]   = useState('');
  const [sheet, setSheet]   = useState<SheetState | null>(null);

  const filtered = people.filter(p =>
    !query || (p.name + ' ' + p.address).toLowerCase().includes(query.toLowerCase())
  );

  const openPerson = (p: Person) => setSheet({ person: p, isNew: false });
  const openNew    = () => setSheet({ person: null, isNew: true });

  const handleSave = (saved: Person) => {
    setPeople(ps =>
      ps.some(p => p.id === saved.id)
        ? ps.map(p => p.id === saved.id ? saved : p)
        : [saved, ...ps]
    );
    setSheet(null);
  };

  const handleDelete = (id: string) => {
    setPeople(ps => ps.filter(p => p.id !== id));
    setSheet(null);
  };

  return (
    <div style={{ fontFamily: T.font }}>
      {/* header */}
      <div style={{ padding: '8px 16px 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, margin: '0 0 2px', letterSpacing: 0.3 }}>
          Visits
        </h1>
        <div style={{ fontSize: 14, color: T.text2, marginBottom: 16 }}>
          {people.length} {people.length === 1 ? 'contact' : 'contacts'} · sorted by interest
        </div>
      </div>

      {/* search bar */}
      <div style={{ padding: '0 16px 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.control, borderRadius: 12, padding: '9px 13px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={T.text2} strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke={T.text2} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name or address"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: T.white, fontFamily: T.font, fontSize: 15,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* list */}
      <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && people.length === 0 && (
          <div style={{ textAlign: 'center', color: T.text3, fontSize: 15, padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 600, color: T.text2, marginBottom: 6 }}>No contacts yet</div>
            <div>Tap + to add your first person</div>
          </div>
        )}
        {filtered.length === 0 && people.length > 0 && (
          <div style={{ textAlign: 'center', color: T.text3, fontSize: 15, padding: '40px 0' }}>
            No matches for "{query}"
          </div>
        )}
        {filtered.map(p => (
          <PersonCard key={p.id} person={p} onOpen={openPerson} />
        ))}
      </div>

      {/* FAB */}
      {!sheet && (
        <button
          onClick={openNew}
          style={{
            position: 'fixed', right: 20, bottom: 96, zIndex: 60,
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

      {/* sheet (Phase 4) */}
      {sheet && (
        <PersonSheet
          person={sheet.person}
          isNew={sheet.isNew}
          userId={userId}
          accessToken={accessToken}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
