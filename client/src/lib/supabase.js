import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjjqrwrlewmotmskxjgo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). If this is a production build, ensure you have rebuilt after adding these to your .env file.');
}

// Create a singleton client or null if key is missing
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

