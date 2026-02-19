import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjjqrwrlewmotmskxjgo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing in Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
