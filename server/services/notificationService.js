const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465 (Implicit SSL), false for 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    authMethod: 'PLAIN',
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1',
        ciphers: 'DEFAULT@SECLEVEL=0'
    },
});

const FROM = process.env.MAIL_FROM || `"Raunak Consultancy" <${process.env.SMTP_USER}>`;

/**
 * Send unified form submission emails (Both to Admin and User)
 * @param {object} formData - The data submitted in the form
 * @param {string} formType - Friendly name of the form (e.g., "Contact Form")
 */
async function sendFormSubmissionEmails(formData, formType) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const userName = formData.name || formData.client_name || 'Valued User';
    const userEmail = formData.email;
    const submissionTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
    });

    // Branding Constants
    const primaryColor = '#1d4ed8'; // Blue-700
    const secondaryColor = '#0f172a'; // Slate-900
    const accentColor = '#3b82f6'; // Blue-500
    const companyName = 'Raunak Consultancy';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Helper: Build table rows for ALL form fields with readable labels
    const SKIP_KEYS = ['id', 'token'];
    const LABEL_MAP = {
        name: 'Full Name',
        client_name: 'Client Name',
        mobile: 'Mobile Number',
        phone: 'Phone Number',
        email: 'Email Address',
        type: 'Service / Type',
        service_type: 'Service Type',
        requirement: 'Requirement / Message',
        notes: 'Additional Notes',
        status: 'Current Status',
        date: 'Preferred Date',
        time: 'Preferred Time',
        meeting_mode: 'Meeting Mode',
        policy_no: 'Policy Number',
        insurance_type: 'Insurance Type',
        claim_type: 'Claim Type',
        message: 'Message',
        subject: 'Subject',
        created_at: 'Submitted At',
    };

    const buildAdminRows = (data) => {
        const rows = [];
        for (const [key, val] of Object.entries(data)) {
            if (SKIP_KEYS.includes(key)) continue;
            if (val === null || val === undefined || val === '') continue;
            const label = LABEL_MAP[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            rows.push(`
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 13px; font-weight: 700; width: 38%; vertical-align: top; text-transform: uppercase; letter-spacing: 0.05em;">${label}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 500; line-height: 1.5; word-break: break-word;">${val}</td>
                </tr>`);
        }
        rows.push(`
            <tr>
                <td style="padding: 12px 16px; background: #f8fafc; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Time of Submission</td>
                <td style="padding: 12px 16px; color: #0f172a; font-size: 14px; font-weight: 500;">${submissionTime}</td>
            </tr>`);
        return rows.join('');
    };

    // 1. Send Email to Admin
    const adminTemplate = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: ${secondaryColor}; padding: 28px 24px; text-align: center;">
                <div style="display: inline-block; background: ${accentColor}; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px;">New Submission</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.025em; font-weight: 800;">${formType}</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Received on ${submissionTime}</p>
            </div>

            <!-- Quick Summary Bar -->
            <div style="background: #eff6ff; padding: 16px 24px; border-bottom: 1px solid #dbeafe; display: flex; gap: 20px; flex-wrap: wrap;">
                <div><span style="color: #64748b; font-size: 12px; font-weight: 600;">FROM</span><br><span style="color: #1d4ed8; font-size: 15px; font-weight: 700;">${userName}</span></div>
                ${formData.mobile || formData.phone ? `<div><span style="color: #64748b; font-size: 12px; font-weight: 600;">MOBILE</span><br><span style="color: #0f172a; font-size: 15px; font-weight: 700;">${formData.mobile || formData.phone}</span></div>` : ''}
                ${formData.email ? `<div><span style="color: #64748b; font-size: 12px; font-weight: 600;">EMAIL</span><br><span style="color: #0f172a; font-size: 15px; font-weight: 700;">${formData.email}</span></div>` : ''}
            </div>

            <!-- Full Details Table -->
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 16px 0; color: ${secondaryColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800;">Complete Submission Details</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    ${buildAdminRows(formData)}
                </table>
            </div>

            <!-- Action Button -->
            <div style="padding: 0 24px 32px; text-align: center;">
                <a href="${clientUrl}/admin/dashboard" style="background: ${primaryColor}; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3); letter-spacing: 0.025em;">
                    Open Admin Dashboard →
                </a>
            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${companyName}. This is an automated system notification.</p>
            </div>
        </div>
    `;

    // 2. Send Confirmation Email to User
    const userTemplate = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); padding: 50px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Thank You!</h1>
                <p style="color: #dbeafe; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">We've received your ${formType}</p>
            </div>
            <div style="padding: 40px; background: #ffffff;">
                <p style="color: ${secondaryColor}; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Dear ${userName},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
                    Thank you for choosing <strong>${companyName}</strong>. We've successfully received your submission and our dedicated team of financial experts is already reviewing it.
                </p>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px solid #eff6ff;">
                    <h3 style="margin: 0 0 20px 0; color: ${primaryColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800;">Summary of Submission</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${Object.entries(formData).map(([key, value]) => {
        const skipKeys = ['id', 'status', 'token', 'date', 'time', 'meeting_mode'];
        if (value === null || value === undefined || skipKeys.includes(key)) return '';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 40%; font-weight: 500;">${label}</td>
                                    <td style="padding: 10px 0; color: ${secondaryColor}; font-size: 14px; font-weight: 600;">${value}</td>
                                </tr>
                            `;
    }).join('')}
                        ${formData.date ? `
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 500;">Date & Time</td>
                                <td style="padding: 10px 0; color: ${secondaryColor}; font-size: 14px; font-weight: 600;">${formData.date} at ${formData.time}</td>
                            </tr>
                        ` : ''}
                    </table>
                </div>

                <div style="background: ${primaryColor}0a; border-left: 4px solid ${primaryColor}; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                    <p style="color: ${primaryColor}; margin: 0; font-size: 14px; font-weight: 600; line-height: 1.5;">
                        "One of our experts will contact you shortly to discuss your requirements in detail."
                    </p>
                </div>

                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 40px;">
                    If you have any urgent questions, please don't hesitate to reply to this email or reach us directly at <strong>+91 9137105476</strong>.
                </p>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 32px;">
                    <p style="margin: 0; color: ${secondaryColor}; font-weight: 800; font-size: 16px;">Best Regards,</p>
                    <p style="margin: 4px 0 0 0; color: ${primaryColor}; font-weight: 700; font-size: 18px;">Team Raunak Consultancy</p>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Your Trusted Financial Partner</p>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500; line-height: 1.6;">
                    <strong>Office:</strong> Om Darshan Heights, Near Hanuman Mandir,<br>Kalyan (E), Dist. Thane - 421306
                </p>
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;">
                    <a href="${clientUrl}" style="color: ${primaryColor}; text-decoration: none; font-size: 13px; font-weight: 600;">Website</a>
                    <span style="color: #cbd5e1;">&bull;</span>
                    <a href="tel:+919137105476" style="color: ${primaryColor}; text-decoration: none; font-size: 13px; font-weight: 600;">Contact Us</a>
                </div>
            </div>
        </div>
    `;

    // Send to Admin
    transporter.sendMail({
        from: FROM,
        to: adminEmail,
        subject: `New ${formType} Form Submission — ${userName}`,
        html: adminTemplate,
    }).catch(err => console.error('[MAILER] Admin notification failed:', err.message));

    // Send Confirmation to User (if email provided)
    if (userEmail) {
        transporter.sendMail({
            from: FROM,
            to: userEmail,
            subject: `Confirmation: New ${formType} Submission`,
            html: userTemplate,
        }).catch(err => console.error('[MAILER] User confirmation failed:', err.message));
    }
}

/**
 * Send email to client when a virtual meeting has started
 */
async function sendMeetingStartEmail(booking, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const joinLink = `${clientUrl}/virtual-office?booking=${booking.id}&token=${token}`;

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1d4ed8; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Consultation is Starting!</h1>
            </div>
            <div style="padding: 40px;">
                <p>Hello <strong>${booking.name}</strong>,</p>
                <p>Your scheduled virtual consultation for <strong>${booking.service_type}</strong> is starting now. Our consultant is waiting for you in the virtual office.</p>
                
                <div style="margin: 40px 0; text-align: center;">
                    <a href="${joinLink}" style="background: #1d4ed8; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Join Meeting Now
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:<br>${joinLink}</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Raunak Consultancy</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: FROM,
        to: booking.email,
        subject: `JOIN NOW: Your Consultation Session has Started`,
        html: html,
    });
}

/**
 * Send Zoom recording link to the client
 */
async function sendRecordingEmail(meeting, recordingUrl) {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Meeting Recording Available</h1>
            </div>
            <div style="padding: 40px;">
                <p>Hello <strong>${meeting.name}</strong>,</p>
                <p>Thank you for attending the consultation session for <strong>${meeting.service_type}</strong>. As requested, here is the recording of our session for your reference.</p>
                
                <div style="margin: 40px 0; text-align: center;">
                    <a href="${recordingUrl}" style="background: #1d4ed8; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        View Recording
                    </a>
                </div>
                
                <p style="color: #475569;">The link will remain active for 7 days. We recommend downloading any information you wish to keep permenantly.</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Raunak Consultancy</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: FROM,
        to: meeting.email,
        subject: `Recording Available: Your Consultation Session`,
        html: html,
    });
}

/**
 * Send booking confirmation (Standalone)
 */
async function sendBookingConfirmationEmail(booking) {
    return sendFormSubmissionEmails(booking, 'Meeting Booking Form');
}

/**
 * Send booking receipt (Placeholder for future PDF integration)
 */
async function sendBookingReceiptEmail(booking, receiptUrl) {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1d4ed8; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Payment Receipt</h1>
            </div>
            <div style="padding: 40px;">
                <p>Hello <strong>${booking.name}</strong>,</p>
                <p>Your payment for the booking <strong>#${booking.id.substring(0, 8)}</strong> has been received successfully.</p>
                
                <div style="margin: 40px 0; text-align: center;">
                    <a href="${receiptUrl}" style="background: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Download Receipt
                    </a>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Raunak Consultancy</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: FROM,
        to: booking.email,
        subject: `Payment Receipt: Booking #${booking.id.substring(0, 8)}`,
        html: html,
    });
}

/**
 * Send status update for bookings
 */
async function sendBookingStatusUpdateEmail(booking, status, zoomLink = null) {
    const primaryColor = '#1d4ed8';
    const statusColor = status === 'Confirmed' ? '#059669' : (status === 'Cancelled' ? '#dc2626' : '#475569');

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Update</h1>
            </div>
            <div style="padding: 40px;">
                <p>Hello <strong>${booking.name}</strong>,</p>
                <p>The status of your booking for <strong>${booking.service_type}</strong> has been updated to:</p>
                
                <div style="margin: 24px 0; text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 20px; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">${status}</span>
                </div>

                ${status === 'Confirmed' && zoomLink ? `
                <p>Your meeting is confirmed for <strong>${booking.date} at ${booking.time}</strong>.</p>
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${zoomLink}" style="background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Join Virtual Office
                    </a>
                </div>
                <p style="font-size: 13px; color: #64748b;">Note: You can join the virtual office at the scheduled time using the link above.</p>
                ` : ''}

                ${status === 'Cancelled' ? `
                <p>We regret to inform you that your booking has been cancelled. If you believe this is an error or wish to reschedule, please contact us.</p>
                ` : ''}

                <p style="margin-top: 32px; font-size: 14px; color: #475569;">If you have any questions, feel free to contact us at +91 9137105476.</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Raunak Consultancy</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: FROM,
        to: booking.email,
        subject: `Update: Your Booking Status is now ${status}`,
        html: html,
    });
}

/**
 * Send status update for insurance claims
 */
async function sendClaimStatusUpdateEmail(claim, status, admin_notes = '') {
    const statusColor = status === 'Approved' ? '#059669' : (status === 'Rejected' ? '#dc2626' : '#d97706');

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Insurance Claim Update</h1>
            </div>
            <div style="padding: 40px;">
                <p>Hello <strong>${claim.client_name}</strong>,</p>
                <p>The status of your <strong>${claim.type}</strong> insurance claim (Policy: ${claim.policy_no || 'N/A'}) has been updated:</p>
                
                <div style="margin: 24px 0; text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 20px; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">${status}</span>
                </div>

                ${admin_notes ? `
                <div style="margin-top: 32px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; text-transform: uppercase;">Notes from our Expert:</h4>
                    <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.6;">${admin_notes}</p>
                </div>
                ` : ''}

                <p style="margin-top: 40px; font-size: 14px; color: #475569;">Our team is working diligently on your case. If you need to submit additional documents or have questions, please contact your account manager directly.</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Raunak Consultancy</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: FROM,
        to: claim.email,
        subject: `Important: Your Claim Status Updated to ${status}`,
        html: html,
    });
}

module.exports = {
    sendMeetingStartEmail,
    sendRecordingEmail,
    sendBookingConfirmationEmail,
    sendBookingReceiptEmail,
    sendBookingStatusUpdateEmail,
    sendClaimStatusUpdateEmail,
    sendFormSubmissionEmails,
};
