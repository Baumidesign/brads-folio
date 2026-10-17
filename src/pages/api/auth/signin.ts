import type { APIRoute } from 'astro';
import { createRequestClient } from '../../../lib/supabase';
import { setSessionCookies } from '../../../lib/session';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }

    // A fresh client per request — signing in on the shared singleton would leave
    // this user's session in memory for every other request on a warm instance.
    const { data, error } = await createRequestClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Redirect back to the login page with a generic error message
      return redirect('/login?error=Invalid credentials. Please try again.');
    }

    setSessionCookies(cookies, data.session);
    return redirect('/planner');
  } catch (e) {
    console.error('SIGNIN_API_ERROR:', e);
    // This is a server-side error, likely due to misconfiguration.
    // Redirecting with an error message prevents the 500 error page.
    return redirect('/login?error=Server authentication error. Please check configuration.');
  }
};
