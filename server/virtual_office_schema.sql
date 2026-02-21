-- ============================================================
-- VIRTUAL OFFICE SCHEMA — Run in Supabase SQL Editor
-- ============================================================

-- 1. Virtual Meetings
CREATE TABLE IF NOT EXISTS virtual_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    zoom_meeting_id TEXT,
    zoom_join_url TEXT,
    zoom_start_url TEXT,
    zoom_password TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled | active | ended
    recording_url TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Waiting Room Entries
CREATE TABLE IF NOT EXISTS meeting_waiting_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES virtual_meetings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    join_requested_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'waiting', -- waiting | admitted | rejected
    admitted_at TIMESTAMPTZ
);

-- 3. Meeting Files (uploaded during meeting)
CREATE TABLE IF NOT EXISTS meeting_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES virtual_meetings(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Meeting Chat Messages
CREATE TABLE IF NOT EXISTS meeting_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES virtual_meetings(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL, -- 'admin' | 'client'
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Useful Indexes
CREATE INDEX IF NOT EXISTS idx_virtual_meetings_booking_id ON virtual_meetings(booking_id);
CREATE INDEX IF NOT EXISTS idx_virtual_meetings_status ON virtual_meetings(status);
CREATE INDEX IF NOT EXISTS idx_waiting_room_meeting_id ON meeting_waiting_room(meeting_id);
CREATE INDEX IF NOT EXISTS idx_waiting_room_status ON meeting_waiting_room(status);
CREATE INDEX IF NOT EXISTS idx_meeting_files_meeting_id ON meeting_files(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_chat_meeting_id ON meeting_chat(meeting_id);

-- 6. Supabase Storage bucket for meeting files
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Name: meeting-files, Public: true

-- 7. Disable RLS for server-side access (using service role key)
ALTER TABLE virtual_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_waiting_room DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chat DISABLE ROW LEVEL SECURITY;
