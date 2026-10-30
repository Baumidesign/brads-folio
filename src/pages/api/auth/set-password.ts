import type { APIRoute } from 'astro';
import { createRequestClient } from '../../../lib/supabase';
import { setSessionCookies } from '../../../lib/session';

const LINK_TYPES = ['invite', 'recovery'] as const;
type LinkType = typeof LINK_TYPES[number];
const MIN_PASSWORD_LENGTH = 8;

// Completes an invite or password-reset link: verifies the one-time token from
// the email, sets the new password, then signs the user in.
// The token is verified here on POST (not when /auth/confirm is first opened) so
// email link-scanners that prefetch the link can't use up the one-time token.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const tokenHash = formData.get('token_hash')?.toString() ?? '';
  const type = formData.get('type')?.toString() as LinkType;
  const password = formData.get('password')?.toString() ?? '';
  const confirm = formData.get('confirm')?.toString() ?? '';

  const back = (error: string) =>
    redirect(`/auth/confirm?${new URLSearchParams({ token_hash: tokenHash, type, error })}`);

  if (!tokenHash || !LINK_TYPES.includes(type)) {
    return redirect('/login?error=That link is invalid. Ask for a new one.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return back(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password !== confirm) {
    return back("Passwords don't match.");
  }

  try {
    const client = createRequestClient();
    const { data, error: verifyError } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    if (verifyError || !data.session) {
      const retry = type === 'invite' ? 'Ask for a new invite.' : 'Request a new reset link.';
      return redirect(`/login?error=${encodeURIComponent(`That link has expired or was already used. ${retry}`)}`);
    }

    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) {
      // The token is now spent, so send them to request a fresh reset link.
      return redirect(`/forgot-password?error=${encodeURIComponent(updateError.message)}`);
    }

    setSessionCookies(cookies, data.session);
    return redirect('/planner/');
  } catch (e) {
    console.error('SET_PASSWORD_API_ERROR:', e);
    return redirect('/login?error=Server authentication error. Please try again.');
  }
};
