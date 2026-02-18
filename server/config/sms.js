const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
const smsFrom = process.env.TWILIO_SMS_FROM;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

const sendWhatsApp = async (to, message) => {
    if (!client || !whatsappFrom) {
        console.warn('[DEBUG] Twilio NOT configured. Skipping WhatsApp.');
        return { success: false, error: 'Twilio not configured' };
    }

    // Ensure 'to' is in 'whatsapp:+91...' format
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+91' + to}`;

    try {
        const response = await client.messages.create({
            body: message,
            from: whatsappFrom,
            to: formattedTo
        });
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('[DEBUG] WhatsApp sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

const sendSMS = async (to, message) => {
    if (!client || !smsFrom) {
        console.warn('[DEBUG] Twilio NOT configured. Skipping SMS.');
        return { success: false, error: 'Twilio not configured' };
    }

    const formattedTo = to.startsWith('+') ? to : `+91${to}`;

    try {
        const response = await client.messages.create({
            body: message,
            from: smsFrom,
            to: formattedTo
        });
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('[DEBUG] SMS sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWhatsApp, sendSMS };
