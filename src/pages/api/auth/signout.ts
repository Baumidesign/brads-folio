import type { APIRoute } from "astro";
import { clearSessionCookies } from "../../../lib/session";
import { supabaseUrl, supabaseKey } from "../../../lib/supabase";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // 1. Revoke this browser's session with Supabase. Uses the user's own access
  //    token rather than the shared singleton client (which holds no user session).
  const accessToken = cookies.get("sb-access-token")?.value;
  if (accessToken) {
    try {
      await fetch(`${supabaseUrl}/auth/v1/logout?scope=local`, {
        method: "POST",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      // Still clear cookies below — the user is signed out of this browser either way.
      console.error("SIGNOUT_API_ERROR:", e);
    }
  }

  // 2. Clear the local browser cookies
  clearSessionCookies(cookies);

  // 3. Send them back to the login page
  return redirect("/login");
};
