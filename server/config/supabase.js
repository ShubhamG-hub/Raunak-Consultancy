require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const dns = require('dns');

// Optional: Set default DNS servers if ENOTFOUND persists
// dns.setServers(['8.8.8.8', '1.1.1.1']);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Key missing in .env');
}

const url = supabaseUrl ? supabaseUrl.trim() : null;
const key = supabaseKey ? supabaseKey.trim() : null;

// Debugging logs to verify env variables
console.log('--- Supabase Initialization ---');
console.log('URL Found:', !!url);
console.log('Key Found:', !!key);

if (!url || !key) {
    console.error('CRITICAL: Supabase URL or Key is missing. Server cannot start properly.');
}

// Fallback to avoid crash during dev if vars are missing, but API calls will fail
const finalUrl = url && url.startsWith('http') ? url : 'https://placeholder.supabase.co';
const finalKey = key || 'placeholder';

// Create Supabase client with retry settings if supported by the version
const supabase = createClient(finalUrl, finalKey, {
    auth: {
        persistSession: false
    },
    global: {
        // Adding headers or fetch options here if needed for reliability
        fetch: (...args) => {
            return fetch(...args).catch(err => {
                console.error('Fetch attempt failed:', err.message);
                throw err;
            });
        }
    }
});

module.exports = supabase;

