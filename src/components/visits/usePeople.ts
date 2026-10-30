import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserSession } from '../../lib/browserSession';
import { startNavProgress, finishNavProgress } from '../../lib/navProgress';
import type { Person } from './types';

// Loads the session and the people list in the browser (shared by the
// Visits and Map screens, which are static pages).
export function usePeople() {
  const [session, setSession] = useState<{ userId: string; accessToken: string } | null>(null);
  const [db, setDb] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    (async () => {
      startNavProgress(35); // keep the loading bar going until the list is in
      const s = await getBrowserSession();
      if (!s) return; // redirecting to /login
      setSession({ userId: s.userId, accessToken: s.accessToken });
      setDb(s.db);
      const { data, error } = await s.db
        .from('people_with_last_visit')
        .select('*')
        .order('interest',        { ascending: false })
        .order('last_visit_date', { ascending: false, nullsFirst: false });
      if (error) {
        console.error('VISITS_FETCH_ERROR:', error);
        setLoadError("Couldn't load your contacts. Reload the page to try again.");
      } else {
        setPeople(data ?? []);
      }
      setLoading(false);
      finishNavProgress();
    })();
  }, []);

  // Apply the result of a save/delete from PersonSheet.
  const upsertPerson = (saved: Person) =>
    setPeople(ps =>
      ps.some(p => p.id === saved.id)
        ? ps.map(p => p.id === saved.id ? saved : p)
        : [saved, ...ps]
    );
  const removePerson = (id: string) => setPeople(ps => ps.filter(p => p.id !== id));

  return { session, db, loading, loadError, people, setPeople, upsertPerson, removePerson };
}
