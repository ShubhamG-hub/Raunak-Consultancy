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
        console.warn('⚠️ Twilio NOT configured. Check .env variables.');
        return { success: false, error: 'Twilio not configured' };
    }

    // Clean 'to' number: strip all non-digits
    let cleanedTo = to.toString().replace(/\D/g, '');

    // Handle India numbers correctly
    // If 10 digits, add 91
    if (cleanedTo.length === 10) {
        cleanedTo = '91' + cleanedTo;
    }
    // If it starts with 91 and has 12 digits, it's already correct
    // If it starts with 0, strip it and add 91
    if (cleanedTo.startsWith('0')) {
        cleanedTo = '91' + cleanedTo.substring(1);
    }

    const formattedTo = `whatsapp:+${cleanedTo}`;

    try {
        const response = await client.messages.create({
            body: message,
            from: whatsappFrom,
            to: formattedTo
        });
        console.log(`✅ WhatsApp sent successfully to ${formattedTo}. SID: ${response.sid}`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error(`❌ WhatsApp FAILED to ${formattedTo}:`, error.message);
        return { success: false, error: error.message };
    }
};

const sendSMS = async (to, message) => {
    if (!client || !smsFrom) {
        console.warn('⚠️ Twilio NOT configured (SMS). Check .env variables.');
        return { success: false, error: 'Twilio not configured' };
    }

    let cleanedTo = to.toString().replace(/\D/g, '');
    if (cleanedTo.length === 10) {
        cleanedTo = '91' + cleanedTo;
    }

    const formattedTo = `+${cleanedTo}`;

    try {
        const response = await client.messages.create({
            body: message,
            from: smsFrom,
            to: formattedTo
        });
        console.log(`✅ SMS sent successfully to ${formattedTo}. SID: ${response.sid}`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error(`❌ SMS FAILED to ${formattedTo}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWhatsApp, sendSMS };
