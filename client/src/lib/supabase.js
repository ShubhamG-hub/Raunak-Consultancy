import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjjqrwrlewmotmskxjgo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanFyd3JsZXdtb3Rtc2t4amdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3Nzg0MSwiZXhwIjoyMDg2MzUzODQxfQ.wYnzT4rAcEjsEk5G0EJLD3EbQmjAh-1CI_N6472XNPI';

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
}

// Create a singleton client
export const supabase = createClient(supabaseUrl, supabaseKey);
