import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erjgptxkctrfszrzhoxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamdwdHhrY3RyZnN6cnpob3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzI5MDYsImV4cCI6MjA3ODQ0ODkwNn0.c9R3aFBRkTbzbZpJG6IneXahB-otUK4Pjrbu7ZhPX1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'effinor_session',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});