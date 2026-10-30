import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Browser-side counterpart to the server page guards. Reads the same
// sb-access-token / sb-refresh-token cookies, refreshes an expired token
// directly with Supabase, and writes the new tokens back so the server
// pages keep working. Lets a page be served statically from the CDN and
// load its data from the browser.

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookies() {
  writeCookie('sb-access-token', '', 0);
  writeCookie('sb-refresh-token', '', 0);
}

function decodeJwt(token: string): { sub: string; exp?: number } | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export interface BrowserSession {
  userId: string;
  accessToken: string;
  db: SupabaseClient;
}

// Returns a session, or null after sending the browser to /login.
export async function getBrowserSession(): Promise<BrowserSession | null> {
  let accessToken = readCookie('sb-access-token');
  const refreshToken = readCookie('sb-refresh-token');

  const toLogin = () => {
    clearCookies();
    location.replace('/login');
    return null;
  };

  if (!accessToken || !refreshToken) return toLogin();

  let claims = decodeJwt(accessToken);

  if (!claims?.exp || claims.exp <= Date.now() / 1000 + 30) {
    const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
      .auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return toLogin();

    accessToken = data.session.access_token;
    claims = decodeJwt(accessToken);
    // Same lifetimes as src/lib/session.ts
    writeCookie('sb-access-token', accessToken, 60 * 60 * 24 * 30);
    writeCookie('sb-refresh-token', data.session.refresh_token, 60 * 60 * 24 * 30);
  }

  if (!claims?.sub) return toLogin();

  return {
    userId: claims.sub,
    accessToken,
    db: createClient(url, key, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    }),
  };
}
