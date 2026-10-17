import type { AstroCookies } from 'astro';
import type { Session } from '@supabase/supabase-js';

// Store a Supabase session in the cookies the protected pages read
// (sb-access-token / sb-refresh-token).
export function setSessionCookies(cookies: AstroCookies, session: Session) {
  cookies.set('sb-access-token', session.access_token, {
    path: '/',
    maxAge: Math.round(session.expires_in),
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });
  cookies.set('sb-refresh-token', session.refresh_token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}
