const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const meetingService = require('../services/meetingService');
const zoomService = require('../services/zoomService');
const notificationService = require('../services/notificationService');

// ─── Middleware: Validate booking access token ────────────────────────────────
function bookingTokenMiddleware(req, res, next) {
    const token = req.query.token || req.headers['x-booking-token'];
    if (!token) return res.status(401).json({ error: 'Booking token required' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.bookingAuth = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired booking token' });
    }
}

// ─── Middleware: Accept admin JWT OR booking token (for chat/files used by client) ─
function flexAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const bookingToken = req.query.token || req.headers['x-booking-token'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Try admin JWT first
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch { /* fall through to booking token */ }
    }

    if (bookingToken) {
        try {
            const decoded = jwt.verify(bookingToken, process.env.JWT_SECRET);
            req.bookingAuth = decoded;
            return next();
        } catch { /* fall through */ }
    }

    return res.status(401).json({ error: 'Authentication required' });
}

// ─── POST /api/virtual-office/start ─────────────────────────────── ADMIN ONLY
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

        const result = await meetingService.startMeeting(bookingId);

        // Send email to client that meeting has started
        try {
            await notificationService.sendMeetingStartEmail(result.booking, result.meeting);
        } catch (emailErr) {
            console.warn('Failed to send meeting start email:', emailErr.message);
        }

        res.json({ success: true, meeting: result.meeting, zoom: result.zoom });
    } catch (err) {
        console.error('Start meeting error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/end/:meetingId ─────────────────────── ADMIN ONLY
router.post('/end/:meetingId', authMiddleware, async (req, res) => {
    try {
        const result = await meetingService.endMeeting(req.params.meetingId);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('End meeting error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/join/:bookingId ──────────────── CLIENT (token auth)
router.get('/join/:bookingId', bookingTokenMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate the token is for this booking
        if (req.bookingAuth.bookingId !== bookingId) {
            return res.status(403).json({ error: 'Token does not match booking' });
        }

        const meeting = await meetingService.getMeetingForBooking(bookingId);
        if (!meeting) {
            return res.status(404).json({ error: 'No active meeting found for this booking' });
        }

        // Generate SDK signature for client (role=0 = attendee)
        const signature = zoomService.generateSDKSignature({
            meetingNumber: meeting.zoom_meeting_id,
            role: 0,
        });

        res.json({
            success: true,
            meetingId: meeting.id,
            zoomMeetingId: meeting.zoom_meeting_id,
            zoomPassword: meeting.zoom_password,
            signature,
            sdkKey: process.env.ZOOM_SDK_KEY,
        });
    } catch (err) {
        console.error('Join error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/generate-booking-token ─────────────── ADMIN ONLY
// Generates a JWT token for a specific booking to share with client
router.post('/generate-booking-token', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

        const token = jwt.sign(
            { bookingId, type: 'meeting_access' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/enter-waiting/:meetingId ───────────── CLIENT
router.post('/enter-waiting/:meetingId', bookingTokenMiddleware, async (req, res) => {
    try {
        const { userName, userEmail, bookingId } = req.body;
        const entry = await meetingService.enterWaitingRoom({
            meetingId: req.params.meetingId,
            bookingId,
            userName,
            userEmail,
        });
        res.json({ success: true, waitingEntry: entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/admission-status/:meetingId ─────────── CLIENT
router.get('/admission-status/:meetingId', bookingTokenMiddleware, async (req, res) => {
    try {
        const { email } = req.query;
        const status = await meetingService.checkAdmissionStatus(req.params.meetingId, email);
        res.json({ success: true, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/waiting-room/:meetingId ─────────────── ADMIN ONLY
router.get('/waiting-room/:meetingId', authMiddleware, async (req, res) => {
    try {
        const queue = await meetingService.getWaitingRoom(req.params.meetingId);
        res.json({ success: true, queue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/admit/:waitingId ───────────────────── ADMIN ONLY
router.post('/admit/:waitingId', authMiddleware, async (req, res) => {
    try {
        const entry = await meetingService.admitUser(req.params.waitingId);
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/reject/:waitingId ──────────────────── ADMIN ONLY
router.post('/reject/:waitingId', authMiddleware, async (req, res) => {
    try {
        const entry = await meetingService.rejectUser(req.params.waitingId);
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/sdk-signature ───────────────────────── ADMIN ONLY
// Admin joins as host (role=1)
router.post('/sdk-signature', authMiddleware, async (req, res) => {
    try {
        const { zoomMeetingId, role = 1 } = req.body;
        const signature = zoomService.generateSDKSignature({ meetingNumber: zoomMeetingId, role });
        res.json({ success: true, signature, sdkKey: process.env.ZOOM_SDK_KEY });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/files/upload ───────────────────────── BOTH
router.post('/files/upload', flexAuthMiddleware, async (req, res) => {
    try {
        const { meetingId, fileName, fileBase64, mimeType, uploadedBy } = req.body;

        // Decode base64 and upload to Supabase Storage
        const fileBuffer = Buffer.from(fileBase64, 'base64');
        const filePath = `meeting-files/${meetingId}/${Date.now()}_${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('meeting-files')
            .upload(filePath, fileBuffer, { contentType: mimeType, upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('meeting-files').getPublicUrl(filePath);

        // Save to DB
        const { data: fileRecord, error: dbErr } = await supabase
            .from('meeting_files')
            .insert({ meeting_id: meetingId, file_name: fileName, file_url: publicUrl, uploaded_by: uploadedBy })
            .select()
            .single();

        if (dbErr) throw dbErr;

        res.json({ success: true, file: fileRecord });
    } catch (err) {
        console.error('File upload error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/files/:meetingId ────────────────────── BOTH
router.get('/files/:meetingId', flexAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('meeting_files')
            .select('*')
            .eq('meeting_id', req.params.meetingId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, files: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/chat ───────────────────────────────── BOTH
router.post('/chat', flexAuthMiddleware, async (req, res) => {
    try {
        const { meetingId, senderName, senderRole, message } = req.body;
        const { data, error } = await supabase
            .from('meeting_chat')
            .insert({ meeting_id: meetingId, sender_name: senderName, sender_role: senderRole, message })
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, chat: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/chat/:meetingId ─────────────────────── BOTH
router.get('/chat/:meetingId', flexAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('meeting_chat')
            .select('*')
            .eq('meeting_id', req.params.meetingId)
            .order('sent_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, chat: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/analytics ───────────────────────────── ADMIN ONLY
router.get('/analytics', authMiddleware, async (req, res) => {
    try {
        const analytics = await meetingService.getAnalytics();
        res.json({ success: true, analytics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/recordings ──────────────────────────── ADMIN ONLY
router.get('/recordings', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('virtual_meetings')
            .select('id, zoom_meeting_id, recording_url, started_at, ended_at, duration_minutes, booking_id, bookings(name, email)')
            .not('recording_url', 'is', null)
            .order('ended_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, recordings: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/meetings ────────────────────────────── ADMIN ONLY
router.get('/meetings', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('virtual_meetings')
            .select('*, bookings(name, email, service, date, time)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json({ success: true, meetings: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/scheduled-bookings ──────────────────── ADMIN ONLY
// Get bookings that don't yet have a meeting, for the "Start Meeting" flow
router.get('/scheduled-bookings', authMiddleware, async (req, res) => {
    try {
        const { data: allBookings, error } = await supabase
            .from('bookings')
            .select('*')
            .in('status', ['Pending', 'Confirmed'])
            .order('date', { ascending: true });

        if (error) throw error;

        // Get bookings that already have an active meeting
        const { data: activeMeetings } = await supabase
            .from('virtual_meetings')
            .select('booking_id')
            .in('status', ['active', 'waiting']);

        const activeMeetingBookingIds = new Set(activeMeetings?.map(m => m.booking_id) || []);

        const bookings = allBookings?.filter(b => !activeMeetingBookingIds.has(b.id)) || [];
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
