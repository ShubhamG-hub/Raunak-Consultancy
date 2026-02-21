-- Run this in your Supabase SQL Editor
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;
