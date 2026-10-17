import type { APIRoute } from 'astro';
import { createRequestClient } from '../../../lib/supabase';

// Sends a password-reset email. The "Reset Password" email template links to
// /auth/confirm?token_hash=…&type=recovery.
export const POST: APIRoute = async ({ request, redirect }) => {
  const email = (await request.formData()).get('email')?.toString().trim();
  if (!email) {
    return redirect('/forgot-password?error=Enter your email address.');
  }

  const { error } = await createRequestClient().auth.resetPasswordForEmail(email);
  if (error) {
    console.error('FORGOT_PASSWORD_API_ERROR:', error.message);
    if (error.status === 429) {
      return redirect('/forgot-password?error=Too many requests. Please wait a few minutes and try again.');
    }
  }

  // Same message whether or not the account exists, so the form can't be used
  // to find out who has an account.
  return redirect('/forgot-password?sent=1');
};
