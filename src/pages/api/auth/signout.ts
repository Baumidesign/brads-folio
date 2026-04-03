import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase"; // Path to your supabase.ts file

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // 1. Tell Supabase to kill the session globally
  await supabase.auth.signOut();

  // 2. Clear the local browser cookies
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  // 3. Send them back to the login page
  return redirect("/login");
};