const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const notificationService = require('../services/notificationService');
const zoomService = require('../services/zoomService');

// ─── Zoom Webhook Handler ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
    if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

    // Validate Zoom webhook signature
    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`;
    const expectedSignature = `v0=${crypto.createHmac('sha256', secret).update(message).digest('hex')}`;
    const receivedSignature = req.headers['x-zm-signature'];

    // Handle URL validation challenge
    if (req.body.event === 'endpoint.url_validation') {
        const hashForValidate = crypto.createHmac('sha256', secret)
            .update(req.body.payload.plainToken)
            .digest('hex');
        return res.status(200).json({
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
        });
    }

    if (expectedSignature !== receivedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload?.object;

    console.log(`📡 Zoom Webhook: ${event}`, payload?.id);

    try {
        if (event === 'meeting.ended') {
            await handleMeetingEnded(payload);
        } else if (event === 'recording.completed') {
            await handleRecordingCompleted(payload);
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Webhook handler error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── Handler: Meeting Ended ───────────────────────────────────────────────────
async function handleMeetingEnded(payload) {
    const zoomMeetingId = String(payload.id);

    const [rows] = await db.query(
        'SELECT * FROM virtual_meetings WHERE zoom_meeting_id = ?',
        [zoomMeetingId]
    );
    const meeting = rows[0];

    if (!meeting) return;

    if (meeting.status !== 'ended') {
        const durationMinutes = Math.round(payload.duration || 0);
        await db.query(
            'UPDATE virtual_meetings SET status = "ended", ended_at = ?, duration_minutes = ? WHERE id = ?',
            [new Date(), durationMinutes, meeting.id]
        );
    }
}

// ─── Handler: Recording Completed ────────────────────────────────────────────
async function handleRecordingCompleted(payload) {
    const zoomMeetingId = String(payload.id);
    const recordingFiles = payload.recording_files || [];

    const videoRecording = recordingFiles.find(f => f.file_type === 'MP4') || recordingFiles[0];
    if (!videoRecording) return;

    const recordingUrl = videoRecording.play_url || videoRecording.download_url;

    const [rows] = await db.query(
        'SELECT vm.*, b.name, b.email, b.service_type FROM virtual_meetings vm JOIN bookings b ON vm.booking_id = b.id WHERE vm.zoom_meeting_id = ?',
        [zoomMeetingId]
    );
    const meeting = rows[0];

    if (!meeting) return;

    await db.query(
        'UPDATE virtual_meetings SET recording_url = ? WHERE id = ?',
        [recordingUrl, meeting.id]
    );

    if (meeting.email) {
        try {
            await notificationService.sendRecordingEmail(meeting, recordingUrl);
        } catch (emailErr) {
            console.warn('Failed to send recording email:', emailErr.message);
        }
    }

    console.log(`✅ Recording saved for meeting ${meeting.id}: ${recordingUrl}`);
}

module.exports = router;
