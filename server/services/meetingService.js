const zoomService = require('./zoomService');
const { supabase } = require('../config/supabase');

// ─── Start a Meeting ──────────────────────────────────────────────────────────
async function startMeeting(bookingId) {
    // Fetch booking details
    const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .select('*, profiles(*)')
        .eq('id', bookingId)
        .single();

    if (bookingErr || !booking) throw new Error('Booking not found');

    // Create Zoom meeting
    const zoomMeeting = await zoomService.createMeeting({
        topic: `Consultation with ${booking.name || 'Client'}`,
        startTime: new Date().toISOString(),
        durationMinutes: 60,
        agenda: `Financial consultation booking #${bookingId}`,
    });

    // Store in database
    const { data: meeting, error: meetingErr } = await supabase
        .from('virtual_meetings')
        .insert({
            booking_id: bookingId,
            zoom_meeting_id: String(zoomMeeting.id),
            zoom_join_url: zoomMeeting.join_url,
            zoom_start_url: zoomMeeting.start_url,
            zoom_password: zoomMeeting.password,
            status: 'active',
            started_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (meetingErr) throw meetingErr;

    // Update booking status to 'confirmed' if not already
    await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

    return { meeting, zoom: zoomMeeting, booking };
}

// ─── End a Meeting ────────────────────────────────────────────────────────────
async function endMeeting(meetingId) {
    const { data: meeting, error } = await supabase
        .from('virtual_meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

    if (error || !meeting) throw new Error('Meeting not found');

    const startedAt = new Date(meeting.started_at);
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt - startedAt) / 60000);

    await supabase
        .from('virtual_meetings')
        .update({
            status: 'ended',
            ended_at: endedAt.toISOString(),
            duration_minutes: durationMinutes,
        })
        .eq('id', meetingId);

    // Reject any still-waiting users
    await supabase
        .from('meeting_waiting_room')
        .update({ status: 'rejected' })
        .eq('meeting_id', meetingId)
        .eq('status', 'waiting');

    return { durationMinutes };
}

// ─── User Enters Waiting Room ─────────────────────────────────────────────────
async function enterWaitingRoom({ meetingId, bookingId, userName, userEmail }) {
    // Check if already in queue
    const { data: existing } = await supabase
        .from('meeting_waiting_room')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('user_email', userEmail)
        .in('status', ['waiting', 'admitted'])
        .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
        .from('meeting_waiting_room')
        .insert({
            meeting_id: meetingId,
            booking_id: bookingId,
            user_name: userName,
            user_email: userEmail,
            status: 'waiting',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ─── Admit / Reject User ──────────────────────────────────────────────────────
async function admitUser(waitingId) {
    const { data, error } = await supabase
        .from('meeting_waiting_room')
        .update({ status: 'admitted', admitted_at: new Date().toISOString() })
        .eq('id', waitingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function rejectUser(waitingId) {
    const { data, error } = await supabase
        .from('meeting_waiting_room')
        .update({ status: 'rejected' })
        .eq('id', waitingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ─── Get Waiting Room Queue ───────────────────────────────────────────────────
async function getWaitingRoom(meetingId) {
    const { data, error } = await supabase
        .from('meeting_waiting_room')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('join_requested_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

// ─── Check Admission Status ───────────────────────────────────────────────────
async function checkAdmissionStatus(meetingId, userEmail) {
    const { data, error } = await supabase
        .from('meeting_waiting_room')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('user_email', userEmail)
        .maybeSingle();

    if (error) throw error;
    return data;
}

// ─── Get Active Meeting for Booking ──────────────────────────────────────────
async function getMeetingForBooking(bookingId) {
    const { data, error } = await supabase
        .from('virtual_meetings')
        .select('*')
        .eq('booking_id', bookingId)
        .in('status', ['active', 'waiting'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
async function getAnalytics() {
    const { data: meetings } = await supabase
        .from('virtual_meetings')
        .select('id, status, duration_minutes, recording_url, started_at, created_at');

    const total = meetings?.length || 0;
    const completed = meetings?.filter(m => m.status === 'ended').length || 0;
    const totalDuration = meetings?.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) || 0;
    const avgDuration = completed > 0 ? Math.round(totalDuration / completed) : 0;
    const recordings = meetings?.filter(m => m.recording_url).length || 0;

    // Meetings grouped by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDate = {};
    meetings?.forEach(m => {
        if (!m.started_at) return;
        const date = new Date(m.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        byDate[date] = (byDate[date] || 0) + 1;
    });

    const chartData = Object.entries(byDate).map(([date, count]) => ({ date, count }));

    return {
        totalMeetings: total,
        completedMeetings: completed,
        totalDurationMinutes: totalDuration,
        avgDurationMinutes: avgDuration,
        totalRecordings: recordings,
        chartData,
    };
}

module.exports = {
    startMeeting,
    endMeeting,
    enterWaitingRoom,
    admitUser,
    rejectUser,
    getWaitingRoom,
    checkAdmissionStatus,
    getMeetingForBooking,
    getAnalytics,
};
