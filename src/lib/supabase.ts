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