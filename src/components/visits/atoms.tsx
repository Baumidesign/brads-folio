import { T, INTEREST, initials } from './tokens';

// ── Avatar ────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0,
      background: '#2C2C2E', color: '#D8D8DC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.font, fontWeight: 600,
      fontSize: Math.round(size * 0.36), letterSpacing: 0.3,
    }}>
      {initials(name)}
    </div>
  );
}

// ── Dots ──────────────────────────────────────────────────────
interface DotsProps {
  value: number;
  size?: number;
  gap?: number;
  onChange?: (v: number) => void;
}

export function Dots({ value, size = 9, gap = 5, onChange }: DotsProps) {
  const editable = !!onChange;
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={editable ? (e) => { e.stopPropagation(); onChange!(n); } : undefined}
          style={{
            width: size, height: size, borderRadius: size, display: 'inline-block',
            background: n <= value ? T.blue : 'rgba(255,255,255,0.14)',
            boxShadow: n <= value ? '0 0 8px rgba(47,107,255,0.5)' : 'none',
            cursor: editable ? 'pointer' : 'default',
            transition: 'background .15s',
          }}
        />
      ))}
    </div>
  );
}

// ── InterestControl ───────────────────────────────────────────
interface InterestControlProps {
  value: number;
  onChange: (v: number) => void;
}

export function InterestControl({ value, onChange }: InterestControlProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: T.control, borderRadius: 14, padding: '10px 16px',
    }}>
      <span style={{ fontFamily: T.font, fontSize: 15, color: T.white, fontWeight: 500 }}>
        {INTEREST[value]?.label ?? ''}
      </span>
      <Dots value={value} size={16} gap={10} onChange={onChange} />
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────
interface LabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Label({ children, style }: LabelProps) {
  return (
    <div style={{
      fontFamily: T.font, fontSize: 12.5, fontWeight: 600, color: T.text2,
      textTransform: 'uppercase', letterSpacing: 1.2,
      margin: '0 0 10px 4px', ...style,
    }}>
      {children}
    </div>
  );
}

// ── PinGlyph ──────────────────────────────────────────────────
interface PinGlyphProps {
  color?: string;
  size?: number;
}

export function PinGlyph({ color = T.text2, size = 13 }: PinGlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"
        stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="10" r="2.4" fill={color} />
    </svg>
  );
}
