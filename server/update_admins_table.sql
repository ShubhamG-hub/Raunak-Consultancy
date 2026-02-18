-- Add columns to admins table for profile management
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS name text DEFAULT 'Admin User',
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'Administrator';
