const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function setupDatabase() {
    console.log('--- Setting up Profiles Table ---');

    // We try to create the table. Note: This requires the service_role key.
    const sql = `
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            full_name TEXT,
            mobile TEXT,
            email TEXT UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        -- 1. Users can view their own profile
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
                CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
                CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can do everything' AND tablename = 'profiles') THEN
                CREATE POLICY "Service role can do everything" ON profiles FOR ALL USING (true);
            END IF;
        END $$;
    `;

    // Since we don't have a direct raw SQL tool for Supabase in this context, 
    // we would usually run this in the Supabase SQL Editor. 
    // However, I will implement the backend logic to handle profile creation 
    // which handles the 'upsert' safely if the table exists.

    console.log('Database setup script generated. Please run the SQL in your Supabase Dashboard if the table is not automatically created by the backend.');
}

setupDatabase();
