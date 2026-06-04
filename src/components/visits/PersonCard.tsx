import { T, relDate } from './tokens';
import { Avatar, Dots, PinGlyph } from './atoms';
import type { Person } from './types';

interface PersonCardProps {
  person: Person;
  onOpen: (p: Person) => void;
}

export function PersonCard({ person: p, onOpen }: PersonCardProps) {
  const visitLabel = p.visit_count === 1 ? '1 visit' : `${p.visit_count} visits`;
  const lastVisit  = p.last_visit_date ? relDate(p.last_visit_date) : 'never visited';

  return (
    <div
      onClick={() => onOpen(p)}
      style={{
        background: T.card, borderRadius: 20, padding: 16, cursor: 'pointer',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        border: '1px solid ' + T.line,
      }}
    >
      <Avatar name={p.name} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* name + dots row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 600, color: T.white }}>
            {p.name}
          </div>
          <div style={{ flexShrink: 0, marginTop: 3 }}>
            <Dots value={p.interest} />
          </div>
        </div>

        {/* area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
          <PinGlyph />
          <span style={{
            fontFamily: T.font, fontSize: 13.5, color: T.text2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {p.address}
          </span>
        </div>

        {/* visit count + last visit */}
        <div style={{ marginTop: 6 }}>
          <span style={{ fontFamily: T.font, fontSize: 12.5, color: T.text3 }}>
            {visitLabel} · {lastVisit}
          </span>
        </div>

        {/* follow-up snippet */}
        {p.follow_up && (
          <div style={{
            marginTop: 11, paddingTop: 11, borderTop: '1px solid ' + T.line,
            display: 'flex', gap: 7, alignItems: 'flex-start',
          }}>
            <span style={{ color: T.blue, fontSize: 13, lineHeight: '18px' }}>↪</span>
            <span style={{
              fontFamily: T.font, fontSize: 13, lineHeight: '18px', color: '#B8B8BD',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {p.follow_up}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
