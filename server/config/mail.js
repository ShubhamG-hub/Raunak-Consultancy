const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // your SMTP username
        pass: process.env.SMTP_PASS, // your SMTP password
    },
});

/**
 * Send a notification email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('[MAILER] SMTP credentials not configured. Skipping email send.');
            return { success: false, error: 'SMTP credentials missing' };
        }

        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || `"Raunak Consultancy" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('[MAILER] Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[MAILER] Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
