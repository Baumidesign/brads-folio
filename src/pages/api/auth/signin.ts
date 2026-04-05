import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return new Response('Email and password are required', { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Redirect back to the login page with a generic error message
    return redirect('/login?error=Invalid credentials. Please try again.');
  }

  const { access_token, refresh_token, expires_in } = data.session;

  // Set cookies for the session
  cookies.set('sb-access-token', access_token, {
    path: '/',
    maxAge: Math.round(expires_in),
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });
  cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });

  return redirect('/planner');
};