const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
});

const FROM = process.env.MAIL_FROM || `"Raunak Consultancy" <${process.env.SMTP_USER}>`;

// ─── Meeting Started Email (sent to client) ───────────────────────────────────
async function sendMeetingStartEmail(booking, meeting) {
    const { name, email } = booking;
    const meetingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/virtual-office?booking=${booking.id}&token=BOOKING_TOKEN`;

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: '🟢 Your Virtual Consultation Is Ready — Join Now',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="background: #1d4ed8; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🎥 Your Meeting is Live!</h1>
                <p style="color: #bfdbfe; margin-top: 8px;">Raunak Consultancy — Virtual Office</p>
            </div>
            <p style="color: #1e293b; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="color: #475569;">Your financial consultation session is now active. Please click the button below to join the virtual office.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${meetingUrl}" style="background: #1d4ed8; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Join Virtual Office →
                </a>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; color: #1e40af;">
                <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> You will enter a waiting room first. The advisor will admit you shortly.</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Raunak Consultancy · Your Financial Partner</p>
        </div>`,
    });
}

// ─── Recording Ready Email (sent to client) ───────────────────────────────────
async function sendRecordingEmail(booking, recordingUrl) {
    const { name, email } = booking;

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: '📹 Your Meeting Recording is Ready',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="background: #0f172a; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">📹 Recording Available</h1>
                <p style="color: #94a3b8; margin-top: 8px;">Raunak Consultancy — Virtual Office</p>
            </div>
            <p style="color: #1e293b; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="color: #475569;">The recording from your consultation session with Sudhir Gupta is now available. You can access it using the link below.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${recordingUrl}" style="background: #0f172a; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Watch Recording →
                </a>
            </div>
            <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 16px; color: #854d0e;">
                <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> This recording link is for your personal use only. It may expire after 30 days.</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Raunak Consultancy · Your Financial Partner</p>
        </div>`,
    });
}

// ─── Meeting Booking Confirmation Email ───────────────────────────────────────
async function sendBookingConfirmationEmail(booking) {
    const { name, email, service, date, time } = booking;

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: '✅ Consultation Booking Confirmed — Raunak Consultancy',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="background: #1d4ed8; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed!</h1>
            </div>
            <p style="color: #1e293b; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="color: #475569;">Your virtual consultation has been confirmed. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #eff6ff;"><td style="padding: 12px; font-weight: bold; color: #1e40af;">Service</td><td style="padding: 12px; color: #1e293b;">${service}</td></tr>
                <tr><td style="padding: 12px; font-weight: bold; color: #1e40af;">Date</td><td style="padding: 12px; color: #1e293b;">${date}</td></tr>
                <tr style="background: #eff6ff;"><td style="padding: 12px; font-weight: bold; color: #1e40af;">Time</td><td style="padding: 12px; color: #1e293b;">${time}</td></tr>
            </table>
            <p style="color: #475569;">You will receive a meeting link via email when the session begins. Please be available 5 minutes before the scheduled time.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Raunak Consultancy · Your Financial Partner</p>
        </div>`,
    });
}

module.exports = {
    sendMeetingStartEmail,
    sendRecordingEmail,
    sendBookingConfirmationEmail,
};
