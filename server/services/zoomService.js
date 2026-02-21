const axios = require('axios');

// ─── Zoom Server-to-Server OAuth ─────────────────────────────────────────────
let _tokenCache = null;

async function getAccessToken() {
    if (_tokenCache && _tokenCache.expiresAt > Date.now()) {
        return _tokenCache.token;
    }

    const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;

    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
        {},
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    const { access_token, expires_in } = response.data;
    _tokenCache = {
        token: access_token,
        expiresAt: Date.now() + (expires_in - 60) * 1000, // refresh 1 min early
    };

    return access_token;
}

// ─── Create a Zoom Meeting ────────────────────────────────────────────────────
async function createMeeting({ topic, startTime, durationMinutes = 60, agenda = '' }) {
    const token = await getAccessToken();

    const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
            topic,
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration: durationMinutes,
            agenda,
            settings: {
                waiting_room: true,
                host_video: true,
                participant_video: true,
                mute_upon_entry: false,
                auto_recording: 'cloud',
                allow_multiple_devices: true,
                use_pmi: false,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
}

// ─── Get Meeting Details ──────────────────────────────────────────────────────
async function getMeeting(zoomMeetingId) {
    const token = await getAccessToken();
    const response = await axios.get(
        `https://api.zoom.us/v2/meetings/${zoomMeetingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
}

// ─── Delete a Meeting ─────────────────────────────────────────────────────────
async function deleteMeeting(zoomMeetingId) {
    const token = await getAccessToken();
    await axios.delete(
        `https://api.zoom.us/v2/meetings/${zoomMeetingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
}

// ─── Get Cloud Recordings ─────────────────────────────────────────────────────
async function getMeetingRecordings(zoomMeetingId) {
    const token = await getAccessToken();
    try {
        const response = await axios.get(
            `https://api.zoom.us/v2/meetings/${zoomMeetingId}/recordings`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
    }
}

// ─── Generate Zoom Meeting SDK Signature ──────────────────────────────────────
// Used by frontend to join meetings via Zoom Web SDK
const crypto = require('crypto');

function generateSDKSignature({ meetingNumber, role = 0 }) {
    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;

    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(`${sdkKey}${meetingNumber}${timestamp}${role}`).toString('base64');
    const hash = crypto.createHmac('sha256', sdkSecret).update(msg).digest('base64');
    const signature = Buffer.from(`${sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');

    return signature;
}

module.exports = {
    getAccessToken,
    createMeeting,
    getMeeting,
    deleteMeeting,
    getMeetingRecordings,
    generateSDKSignature,
};
