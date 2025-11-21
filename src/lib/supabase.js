import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jlofdpmyywcfhsmhfnnl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsb2ZkcG15eXdjZmhzbWhmbm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzIyNDUsImV4cCI6MjA3ODQ0ODI0NX0.wldxtTNUQ5OmKfmaB7WOvCCKndThlsAMfFly8WXt0Xc'; // This is your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);