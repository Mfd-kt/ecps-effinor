import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging (only in development or if explicitly enabled)
if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_ENV) {
  console.log('[Supabase Client] Environment check:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `Missing Supabase environment variables. 
  
  Current values:
  - VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'MISSING'}
  - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'MISSING'}
  - Mode: ${import.meta.env.MODE}
  - Dev: ${import.meta.env.DEV}
  - Prod: ${import.meta.env.PROD}
  
  Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
  For production builds, ensure .env.production exists with these values.`;
  
  console.error('[Supabase Client]', errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'effinor_session',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export par défaut optionnel
export default supabase;