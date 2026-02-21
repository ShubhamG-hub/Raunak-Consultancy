const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabase } = require('../config/supabase');
const notificationService = require('../services/notificationService');
const zoomService = require('../services/zoomService');

// ─── Zoom Webhook Handler ─────────────────────────────────────────────────────
// POST /api/zoom/webhook
router.post('/', async (req, res) => {
    const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

    // Validate Zoom webhook signature
    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`;
    const expectedSignature = `v0=${crypto.createHmac('sha256', secret).update(message).digest('hex')}`;
    const receivedSignature = req.headers['x-zm-signature'];

    // Handle URL validation challenge (Zoom sends this when first configuring webhook)
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

    const { data: meeting } = await supabase
        .from('virtual_meetings')
        .select('*, bookings(name, email)')
        .eq('zoom_meeting_id', zoomMeetingId)
        .maybeSingle();

    if (!meeting) return;

    // Update meeting status if not already ended
    if (meeting.status !== 'ended') {
        const durationMinutes = Math.round(payload.duration || 0);
        await supabase
            .from('virtual_meetings')
            .update({
                status: 'ended',
                ended_at: new Date().toISOString(),
                duration_minutes: durationMinutes,
            })
            .eq('id', meeting.id);
    }
}

// ─── Handler: Recording Completed ────────────────────────────────────────────
async function handleRecordingCompleted(payload) {
    const zoomMeetingId = String(payload.id);
    const recordingFiles = payload.recording_files || [];

    // Find the best recording (prefer MP4 video)
    const videoRecording = recordingFiles.find(f => f.file_type === 'MP4') || recordingFiles[0];
    if (!videoRecording) return;

    const recordingUrl = videoRecording.play_url || videoRecording.download_url;

    const { data: meeting } = await supabase
        .from('virtual_meetings')
        .select('*, bookings(name, email, service)')
        .eq('zoom_meeting_id', zoomMeetingId)
        .maybeSingle();

    if (!meeting) return;

    // Store recording URL in database
    await supabase
        .from('virtual_meetings')
        .update({ recording_url: recordingUrl })
        .eq('id', meeting.id);

    // Send recording email to client
    if (meeting.bookings?.email) {
        try {
            await notificationService.sendRecordingEmail(meeting.bookings, recordingUrl);
        } catch (emailErr) {
            console.warn('Failed to send recording email:', emailErr.message);
        }
    }

    console.log(`✅ Recording saved for meeting ${meeting.id}: ${recordingUrl}`);
}

module.exports = router;
