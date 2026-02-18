USE [MERN + Supabase] Tasks database configuration;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Admins Table
create table admins (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leads Table
create table leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  mobile text not null,
  requirement text,
  type text check (type in ('consultation', 'contact', 'portfolio')),
  status text default 'New' check (status in ('New', 'Contacted', 'Closed')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Testimonials Table
create table testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  content text not null,
  rating integer check (rating >= 1 and rating <= 5),
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Claims Table
create table claims (
  id uuid default uuid_generate_v4() primary key,
  client_name text not null,
  policy_no text,
  type text check (type in ('Death Claim', 'Maturity Claim', 'Health Claim', 'Other')),
  status text default 'Pending' check (status in ('Pending', 'Processing', 'Settled', 'Rejected')),
  documents text[], -- Array of URLs
  description text,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services Table (For dynamic content)
create table services (
  id uuid default uuid_generate_v4() primary key,
  title text not null unique,
  slug text not null unique,
  short_description text,
  content text, -- HTML or Markdown
  icon text, -- Lucide icon name
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Certificates Table
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  expiry_date date,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) policies
-- Note: In a simple setup with a single backend connecting via service role key, RLS might be bypassed or set to public-read/service-write.
-- For this "private admin" setup, we will rely on the backend to enforce permissions, 
-- but enabling RLS is good practice if we were using Supabase Client directly from frontend.
alter table admins enable row level security;
alter table leads enable row level security;
alter table testimonials enable row level security;
alter table claims enable row level security;
alter table services enable row level security;
alter table certificates enable row level security;
