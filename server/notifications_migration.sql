-- Notifications Table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('new_lead', 'new_chat', 'new_testimonial', 'claim_update')),
  title text not null,
  message text not null,
  read boolean default false,
  reference_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notifications enable row level security;

-- Index for faster unread queries
create index idx_notifications_read on notifications(read);
create index idx_notifications_created_at on notifications(created_at desc);
