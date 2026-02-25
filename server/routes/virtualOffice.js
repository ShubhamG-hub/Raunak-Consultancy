const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const meetingService = require('../services/meetingService');
const zoomService = require('../services/zoomService');
const notificationService = require('../services/notificationService');
const Joi = require('joi');

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
    const startSchema = Joi.object({
        bookingId: Joi.string().required()
    });

    const { error } = startSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { bookingId } = req.body;

        const result = await meetingService.startMeeting(bookingId);

        // Send email to client that meeting has started
        try {
            // Generate join link for Email
            const token = jwt.sign({ bookingId: result.booking.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

            await notificationService.sendMeetingStartEmail(result.booking, token);
        } catch (err) {
            console.warn('Failed to send meeting start email notification:', err.message);
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
router.post('/generate-booking-token', authMiddleware, async (req, res) => {
    const tokenGenSchema = Joi.object({
        bookingId: Joi.string().required()
    });

    const { error } = tokenGenSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { bookingId } = req.body;

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
    const enterWaitingSchema = Joi.object({
        userName: Joi.string().required(),
        userEmail: Joi.string().email().required(),
        bookingId: Joi.string().required()
    });

    const { error } = enterWaitingSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

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

        // NOTE: File storage currently handled via base64 in artifacts if possible,
        // but for MySQL migration we assume file_url is provided or we use a placeholder link.
        // In a real scenario, this would go to S3 or similar.
        // For now, we just save the record to DB.

        const fileUrl = `https://storage.placeholder.com/${meetingId}/${fileName}`; // Placeholder

        await db.query(
            'INSERT INTO meeting_files (meeting_id, file_name, file_url, uploaded_by) VALUES (?, ?, ?, ?)',
            [meetingId, fileName, fileUrl, uploadedBy]
        );

        res.json({ success: true, file: { meeting_id: meetingId, file_name: fileName, file_url: fileUrl, uploaded_by: uploadedBy } });
    } catch (err) {
        console.error('File upload error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/files/:meetingId ────────────────────── BOTH
router.get('/files/:meetingId', flexAuthMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM meeting_files WHERE meeting_id = ? ORDER BY uploaded_at DESC',
            [req.params.meetingId]
        );
        res.json({ success: true, files: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/virtual-office/chat ───────────────────────────────── BOTH
router.post('/chat', flexAuthMiddleware, async (req, res) => {
    const chatSchema = Joi.object({
        meetingId: Joi.string().required(),
        senderName: Joi.string().required(),
        senderRole: Joi.string().valid('admin', 'client').required(),
        message: Joi.string().required()
    });

    const { error } = chatSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { meetingId, senderName, senderRole, message } = req.body;
        await db.query(
            'INSERT INTO meeting_chat (meeting_id, sender_name, sender_role, message) VALUES (?, ?, ?, ?)',
            [meetingId, senderName, senderRole === 'admin' ? 'admin' : 'client', message]
        );

        res.json({ success: true, chat: { meeting_id: meetingId, sender_name: senderName, sender_role: senderRole, message } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/chat/:meetingId ─────────────────────── BOTH
router.get('/chat/:meetingId', flexAuthMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM meeting_chat WHERE meeting_id = ? ORDER BY sent_at ASC',
            [req.params.meetingId]
        );
        res.json({ success: true, chat: rows });
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
        const [rows] = await db.query(`
            SELECT vm.id, vm.zoom_meeting_id, vm.recording_url, vm.started_at, vm.ended_at, vm.duration_minutes, vm.booking_id, b.name, b.email
            FROM virtual_meetings vm
            JOIN bookings b ON vm.booking_id = b.id
            WHERE vm.recording_url IS NOT NULL
            ORDER BY vm.ended_at DESC
        `);
        res.json({ success: true, recordings: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/meetings ────────────────────────────── ADMIN ONLY
router.get('/meetings', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT vm.*, b.name, b.email, b.service_type, b.date, b.time
            FROM virtual_meetings vm
            LEFT JOIN bookings b ON vm.booking_id = b.id
            ORDER BY vm.created_at DESC
            LIMIT 50
        `);
        res.json({ success: true, meetings: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/virtual-office/scheduled-bookings ──────────────────── ADMIN ONLY
router.get('/scheduled-bookings', authMiddleware, async (req, res) => {
    try {
        const [allBookings] = await db.query(
            'SELECT * FROM bookings WHERE status IN ("Pending", "Confirmed") ORDER BY date ASC'
        );

        const [activeMeetings] = await db.query(
            'SELECT booking_id FROM virtual_meetings WHERE status IN ("active", "waiting")'
        );

        const activeMeetingBookingIds = new Set(activeMeetings.map(m => m.booking_id));
        const bookings = allBookings.filter(b => !activeMeetingBookingIds.has(b.id));

        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
