-- Create Bookings Table
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  date date not null,
  time text not null,
  service_type text not null,
  message text,
  status text default 'Pending' check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table bookings enable row level security;

-- Policies
-- 1. Allow public to insert bookings (anyone can book)
create policy "Allow public to insert bookings"
on bookings for insert
with check (true);

-- 2. Allow admin to select/view all bookings
-- Assuming we use Supabase Auth and admin users have a 'role' claim or exist in a profiles table
-- For simplicity, if we are using the service_role key on the backend, RLS is bypassed.
-- However, for client-side access, we can restrict by role if configured in auth.users.
-- Since the current project uses a hybrid approach, we'll assume the backend (service role) handles management.
-- If someone uses the public key, they should only see their own or nothing.
create policy "Allow admins to manage all bookings"
on bookings
for all
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

-- Add sample check for today bookings (optional helper view)
-- create or replace view today_bookings as
-- select * from bookings where date = current_date;
