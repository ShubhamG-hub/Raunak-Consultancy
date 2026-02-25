const zoomService = require('./zoomService');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─── Start a Meeting ──────────────────────────────────────────────────────────
async function startMeeting(bookingId) {
    // Fetch booking details
    const [bookingRows] = await db.query(
        'SELECT * FROM bookings WHERE id = ?',
        [bookingId]
    );
    const booking = bookingRows[0];

    if (!booking) throw new Error('Booking not found');

    // Create Zoom meeting
    const zoomMeeting = await zoomService.createMeeting({
        topic: `Consultation with ${booking.name || 'Client'}`,
        startTime: new Date().toISOString(),
        durationMinutes: 60,
        agenda: `Financial consultation booking #${bookingId}`,
    });

    // Store in database
    const meetingId = uuidv4();
    await db.query(
        'INSERT INTO virtual_meetings (id, booking_id, zoom_meeting_id, zoom_join_url, zoom_start_url, zoom_password, status, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            meetingId,
            bookingId,
            String(zoomMeeting.id),
            zoomMeeting.join_url,
            zoomMeeting.start_url,
            zoomMeeting.password,
            'active',
            new Date()
        ]
    );

    // Fetch the inserted meeting
    const [meetingRows] = await db.query('SELECT * FROM virtual_meetings WHERE id = ?', [meetingId]);
    const meeting = meetingRows[0];

    // Update booking status to 'confirmed' if not already
    await db.query(
        'UPDATE bookings SET status = "Confirmed" WHERE id = ?',
        [bookingId]
    );

    return { meeting, zoom: zoomMeeting, booking };
}

// ─── End a Meeting ───────────────────────────────────────
async function endMeeting(meetingId) {
    const [meetingRows] = await db.query('SELECT * FROM virtual_meetings WHERE id = ?', [meetingId]);
    const meeting = meetingRows[0];

    if (!meeting) throw new Error('Meeting not found');

    const startedAt = new Date(meeting.started_at);
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt - startedAt) / 60000);

    await db.query(
        'UPDATE virtual_meetings SET status = "ended", ended_at = ?, duration_minutes = ? WHERE id = ?',
        [endedAt, durationMinutes, meetingId]
    );

    // Reject any still-waiting users
    await db.query(
        'UPDATE meeting_waiting_room SET status = "rejected" WHERE meeting_id = ? AND status = "waiting"',
        [meetingId]
    );

    return { durationMinutes };
}

// ─── User Enters Waiting Room ─────────────────────────────────────────────────
async function enterWaitingRoom({ meetingId, bookingId, userName, userEmail }) {
    // Check if already in queue
    const [existingRows] = await db.query(
        'SELECT * FROM meeting_waiting_room WHERE meeting_id = ? AND user_email = ? AND status IN ("waiting", "admitted")',
        [meetingId, userEmail]
    );

    if (existingRows.length > 0) return existingRows[0];

    const [result] = await db.query(
        'INSERT INTO meeting_waiting_room (meeting_id, booking_id, user_name, user_email, status) VALUES (?, ?, ?, ?, ?)',
        [meetingId, bookingId, userName, userEmail, 'waiting']
    );

    const [newEntry] = await db.query('SELECT * FROM meeting_waiting_room WHERE id = ?', [result.insertId]);
    return newEntry[0];
}

// ─── Admit / Reject User ──────────────────────────────────────────────────────
async function admitUser(waitingId) {
    await db.query(
        'UPDATE meeting_waiting_room SET status = "admitted", admitted_at = ? WHERE id = ?',
        [new Date(), waitingId]
    );

    const [rows] = await db.query('SELECT * FROM meeting_waiting_room WHERE id = ?', [waitingId]);
    return rows[0];
}

async function rejectUser(waitingId) {
    await db.query(
        'UPDATE meeting_waiting_room SET status = "rejected" WHERE id = ?',
        [waitingId]
    );

    const [rows] = await db.query('SELECT * FROM meeting_waiting_room WHERE id = ?', [waitingId]);
    return rows[0];
}

// ─── Get Waiting Room Queue ───────────────────────────────────────────────────
async function getWaitingRoom(meetingId) {
    const [rows] = await db.query(
        'SELECT * FROM meeting_waiting_room WHERE meeting_id = ? ORDER BY join_requested_at ASC',
        [meetingId]
    );
    return rows;
}

// ─── Check Admission Status ───────────────────────────────────────────────────
async function checkAdmissionStatus(meetingId, userEmail) {
    const [rows] = await db.query(
        'SELECT * FROM meeting_waiting_room WHERE meeting_id = ? AND user_email = ?',
        [meetingId, userEmail]
    );
    return rows[0];
}

// ─── Get Active Meeting for Booking ──────────────────────────────────────────
async function getMeetingForBooking(bookingId) {
    const [rows] = await db.query(
        'SELECT * FROM virtual_meetings WHERE booking_id = ? AND status IN ("active", "waiting") ORDER BY created_at DESC LIMIT 1',
        [bookingId]
    );
    return rows[0];
}

// ─── Analytics ────────────────────────────────────────────────────────────────
async function getAnalytics() {
    const [meetings] = await db.query(
        'SELECT id, status, duration_minutes, recording_url, started_at, created_at FROM virtual_meetings'
    );

    const total = meetings.length;
    const completed = meetings.filter(m => m.status === 'ended').length;
    const totalDuration = meetings.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);
    const avgDuration = completed > 0 ? Math.round(totalDuration / completed) : 0;
    const recordings = meetings.filter(m => m.recording_url).length;

    // Meetings grouped by date (last 30 days)
    const byDate = {};
    meetings.forEach(m => {
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
