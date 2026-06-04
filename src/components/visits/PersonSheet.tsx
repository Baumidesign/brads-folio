import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { T } from './tokens';
import { Avatar, InterestControl, Label, PinGlyph } from './atoms';
import type { Person } from './types';

interface VisitDraft {
  id: string;
  visit_date: string;
  notes: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface PersonSheetProps {
  person: Person | null;
  isNew: boolean;
  userId: string;
  accessToken: string;
  onSave: (p: Person) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: T.control, border: 'none', borderRadius: 14,
  padding: '13px 15px', color: T.white,
  fontFamily: T.font, fontSize: 16, outline: 'none', resize: 'none',
};

export function PersonSheet({ person, isNew, userId, accessToken, onSave, onDelete, onClose }: PersonSheetProps) {
  const supabase = useMemo(() => createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  ), [accessToken]);

  const [draft, setDraft] = useState({
    name:      person?.name      ?? '',
    address:   person?.address   ?? '',
    area:      person?.area      ?? '',
    interest:  person?.interest  ?? 3,
    follow_up: person?.follow_up ?? '',
  });

  const [visits, setVisits]             = useState<VisitDraft[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(!isNew);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const set = (k: string, v: unknown) => setDraft(d => ({ ...d, [k]: v }));

  useEffect(() => {
    if (!isNew && person) {
      supabase
        .from('visits')
        .select('*')
        .eq('person_id', person.id)
        .order('visit_date', { ascending: false })
        .then(({ data }) => {
          setVisits(data?.map(v => ({ id: v.id, visit_date: v.visit_date, notes: v.notes })) ?? []);
          setLoadingVisits(false);
        });
    } else {
      setVisits([{ id: `new_${Date.now()}`, visit_date: todayISO(), notes: '', isNew: true }]);
    }
  }, []);

  const addVisit = () => setVisits(vs => [
    { id: `new_${Date.now()}`, visit_date: todayISO(), notes: '', isNew: true },
    ...vs,
  ]);

  const removeVisit = (id: string) => setVisits(vs =>
    vs.map(v => v.id === id ? { ...v, isDeleted: true } : v)
  );

  const setVisitField = (id: string, k: 'visit_date' | 'notes', val: string) => setVisits(vs =>
    vs.map(v => v.id === id ? { ...v, [k]: val } : v)
  );

  const visibleVisits = visits.filter(v => !v.isDeleted);

  const handleSave = async () => {
    if (!draft.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);

    if (isNew) {
      const { data: newPerson, error: insertErr } = await supabase
        .from('people')
        .insert({ ...draft, user_id: userId })
        .select()
        .single();

      if (insertErr || !newPerson) {
        setError(insertErr?.message ?? 'Failed to save person.');
        setSaving(false);
        return;
      }

      const firstVisit = visits[0];
      let lastDate: string | null = null;
      let visitCount = 0;

      if (firstVisit) {
        const { data: v } = await supabase
          .from('visits')
          .insert({
            person_id:  newPerson.id,
            user_id:    userId,
            visit_date: firstVisit.visit_date,
            notes:      firstVisit.notes,
          })
          .select()
          .single();
        if (v) { lastDate = v.visit_date; visitCount = 1; }
      }

      onSave({ ...newPerson, last_visit_date: lastDate, visit_count: visitCount });
    } else {
      const { data: updatedPerson, error: updateErr } = await supabase
        .from('people')
        .update(draft)
        .eq('id', person!.id)
        .select()
        .single();

      if (updateErr || !updatedPerson) {
        setError(updateErr?.message ?? 'Failed to save changes.');
        setSaving(false);
        return;
      }

      const toAdd    = visits.filter(v =>  v.isNew    && !v.isDeleted);
      const toDelete = visits.filter(v =>  v.isDeleted && !v.isNew);
      const toUpdate = visits.filter(v => !v.isNew    && !v.isDeleted);

      await Promise.all([
        ...toAdd.map(v    => supabase.from('visits').insert({ person_id: person!.id, user_id: userId, visit_date: v.visit_date, notes: v.notes })),
        ...toDelete.map(v => supabase.from('visits').delete().eq('id', v.id)),
        ...toUpdate.map(v => supabase.from('visits').update({ visit_date: v.visit_date, notes: v.notes }).eq('id', v.id)),
      ]);

      const sorted   = [...visibleVisits].sort((a, b) => b.visit_date.localeCompare(a.visit_date));
      onSave({
        ...updatedPerson,
        last_visit_date: sorted[0]?.visit_date ?? null,
        visit_count:     visibleVisits.length,
      });
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!person) return;
    const { error: deleteErr } = await supabase.from('people').delete().eq('id', person.id);
    if (deleteErr) { setError(deleteErr.message); return; }
    onDelete(person.id);
  };

  return (
    <>
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* scrim */}
        <div
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
        />

        {/* sheet */}
        <div style={{
          position: 'relative', background: '#141416',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '92%', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          animation: 'sheetUp .28s cubic-bezier(.2,.8,.2,1)',
        }}>
          {/* grabber */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
            <div style={{ width: 38, height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.2)' }} />
          </div>

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 20px 6px', flexShrink: 0 }}>
            <Avatar name={draft.name || '?'} size={48} />
            <input
              value={draft.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Full name"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: T.white, fontFamily: T.font, fontSize: 22, fontWeight: 700,
              }}
            />
            <button
              onClick={onClose}
              style={{
                background: T.control, border: 'none', width: 32, height: 32,
                borderRadius: 32, color: T.text2, fontSize: 17, cursor: 'pointer', flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* scrollable body */}
          <div style={{ overflowY: 'auto', padding: '12px 20px 40px' }}>

            {error && (
              <div style={{
                background: T.red + '22', border: '1px solid ' + T.red + '55',
                borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                color: T.red, fontFamily: T.font, fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {/* interest */}
            <Label>Interest level</Label>
            <InterestControl value={draft.interest} onChange={v => set('interest', v)} />

            {/* address */}
            <div style={{ height: 22 }} />
            <Label>Address</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: T.control, borderRadius: 14, padding: '0 14px' }}>
              <PinGlyph color={T.blue} size={16} />
              <input
                value={draft.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Street, suburb"
                style={{ ...fieldStyle, background: 'none', padding: '13px 0', borderRadius: 0 }}
              />
            </div>

            {/* area */}
            <div style={{ height: 10 }} />
            <input
              value={draft.area}
              onChange={e => set('area', e.target.value)}
              placeholder="Area (e.g. Northcote)"
              style={{ ...fieldStyle }}
            />

            {/* visit history */}
            <div style={{ height: 22 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Label style={{ margin: 0 }}>Visit history</Label>
              <button
                onClick={addVisit}
                style={{
                  background: T.blueDim, color: T.blue, border: 'none',
                  borderRadius: 999, padding: '5px 12px',
                  fontFamily: T.font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >+ Log visit</button>
            </div>

            {loadingVisits ? (
              <div style={{ color: T.text3, fontFamily: T.font, fontSize: 14, padding: '12px 0' }}>
                Loading visits…
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visibleVisits.length === 0 && (
                  <div style={{ color: T.text3, fontFamily: T.font, fontSize: 14, padding: '12px 0' }}>
                    No visits yet — tap "+ Log visit" to add one
                  </div>
                )}
                {visibleVisits.map((vis, i) => (
                  <div key={vis.id} style={{ background: T.control, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 7, background: i === 0 ? T.blue : T.text3, flexShrink: 0 }} />
                        <input
                          type="date"
                          value={vis.visit_date}
                          onChange={e => setVisitField(vis.id, 'visit_date', e.target.value)}
                          style={{
                            background: 'none', border: 'none', outline: 'none',
                            color: i === 0 ? T.white : '#C5C5CA',
                            fontFamily: T.font, fontSize: 14, fontWeight: 600,
                            colorScheme: 'dark',
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removeVisit(vis.id)}
                        style={{ background: 'none', border: 'none', color: T.text3, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={vis.notes}
                      onChange={e => setVisitField(vis.id, 'notes', e.target.value)}
                      placeholder="What happened on this visit…"
                      rows={3}
                      style={{ ...fieldStyle, background: '#1C1C1E', fontSize: 14.5, lineHeight: '20px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* follow-up */}
            <div style={{ height: 22 }} />
            <Label>Follow-up · what to talk about next</Label>
            <textarea
              value={draft.follow_up}
              onChange={e => set('follow_up', e.target.value)}
              placeholder="Notes for next time — questions to ask, things to bring…"
              rows={3}
              style={{ ...fieldStyle, background: T.blueDim, lineHeight: '21px', border: '1px solid rgba(47,107,255,0.25)' }}
            />

            {/* actions */}
            <div style={{ height: 26 }} />
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', background: saving ? T.text3 : T.blue,
                color: '#fff', border: 'none', borderRadius: 16, padding: '16px',
                fontFamily: T.font, fontSize: 17, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}
            >
              {saving ? 'Saving…' : isNew ? 'Add person' : 'Save changes'}
            </button>

            {!isNew && (
              <button
                onClick={handleDelete}
                style={{
                  width: '100%', background: 'none', color: T.red, border: 'none',
                  padding: '15px', marginTop: 4,
                  fontFamily: T.font, fontSize: 16, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Delete person
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
