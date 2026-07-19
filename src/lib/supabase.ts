import { createClient } from '@supabase/supabase-js';

// 1. Try to get variables from Astro's import.meta.env (Works locally and in some build steps)
// 2. Fall back to standard Node process.env (Required for Netlify Serverless Functions)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Fail loudly if we STILL can't find them, so we know exactly what's wrong.
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase Environment Variables. Check Netlify settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// A fresh, request-scoped client authenticated via an Authorization header
// rather than by mutating the shared `supabase` singleton's session. Pass
// an access token to run RLS-scoped queries as that user; omit it for a
// one-off unauthenticated operation (e.g. a token refresh call).
export function createRequestClient(accessToken?: string) {
  return createClient(
    supabaseUrl,
    supabaseKey,
    accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined
  );
}

// Reads a JWT's payload locally (no network call) so callers can check
// expiry/claims without hitting Supabase's /auth/v1/user endpoint.
export function decodeAccessToken(token: string): { sub: string; email?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}