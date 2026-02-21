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

/**
 * Send a welcome email to new users
 * @param {object} userData - User information (email, full_name)
 * @param {string} password - User's password (plain text as requested)
 */
const sendWelcomeEmail = async (userData, password) => {
    const subject = 'Welcome to Raunak Consultancy - Your Login Credentials';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to Raunak Consultancy!</h2>
            <p>Hello <strong>${userData.full_name || 'Valued User'}</strong>,</p>
            <p>We are excited to have you on board. Your account has been created successfully.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; margin-bottom: 10px;"><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'https://raunakconsultancy.com'}">raunakconsultancy.com</a></p>
                <p style="margin: 0; margin-bottom: 10px;"><strong>Username (Email):</strong> ${userData.email}</p>
                <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p>For your security, we recommend changing your password after your first login.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">
                &copy; ${new Date().getFullYear()} Raunak Consultancy. All rights reserved.
            </p>
        </div>
    `;
    return sendEmail(userData.email, subject, html);
};

module.exports = { sendEmail, sendWelcomeEmail };
