import { createClient } from '@supabase/supabase-js';
import { config } from '@/config';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error(
    'Configuration Supabase manquante. Vérifiez vos variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
  );
}

const customSupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
