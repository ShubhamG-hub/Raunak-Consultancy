const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const { sendEmail } = require('../config/mail');
const { sendWhatsApp, sendSMS } = require('../config/sms');

const claimSchema = Joi.object({
    client_name: Joi.string().pattern(/^[a-zA-Z\s]+$/).message('Name must contain only letters').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).message('Enter a valid 10-digit mobile number').required(),
    policy_no: Joi.string().optional(),
    type: Joi.string().required(),
    description: Joi.string().optional(),
    documents: Joi.array().items(Joi.string().uri()).optional()
});

// Helper to validate UUID
const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// POST /api/claims (Public)
router.post('/', async (req, res) => {
    const { error, value } = claimSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const insertClaim = async (payload) => {
        return await supabase
            .from('claims')
            .insert([{ ...payload, status: 'Pending' }])
            .select();
    };

    try {
        console.log('[DEBUG] Received Claim Submission:', value);
        let { data, error: dbError } = await insertClaim(value);

        // Fallback: If columns email/phone are missing in DB (PGRST204)
        if (dbError && dbError.code === 'PGRST204') {
            console.warn('[BACKWARD COMPATIBILITY] Missing email/phone columns. Retrying without them.');
            const safeValue = { ...value };
            delete safeValue.email;
            delete safeValue.phone;
            const retry = await insertClaim(safeValue);
            data = retry.data;
            dbError = retry.error;
        }

        if (dbError) throw dbError;

        console.log('[DEBUG] Claim Stored Successfully:', data[0]);
        console.log(`[NEW CLAIM] Admin Notification: Claim submitted by ${value.client_name}`);

        res.status(201).json({ message: 'Claim request submitted.', id: data[0].id });
    } catch (err) {
        console.error('Claim Submission Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/claims (Admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('claims')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

// PUT /api/claims/:id (Admin Update)
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    console.log(`[DEBUG] Received Claim Update for ${id}:`, { status, admin_notes });

    // Validate UUID to prevent DB crash
    if (!isUUID(id)) {
        return res.status(400).json({ error: 'Invalid claim ID format' });
    }

    try {
        // First get the claim to have the contact info
        const { data: initialClaim, error: fetchError } = await supabase
            .from('claims')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!initialClaim) return res.status(404).json({ error: 'Claim not found' });

        const { data, error } = await supabase
            .from('claims')
            .update({ status, admin_notes })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Trigger Notification if status changed
        if (initialClaim.status !== status) {
            console.log(`[DEBUG] Status changed from ${initialClaim.status} to ${status}. Sending notifications...`);

            const messageText = `Your insurance claim status has been updated to: ${status}. Reference ID: ${id.substring(0, 8)}. Notes: ${admin_notes || 'No notes provided'}. - Raunak Consultancy`;

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #1a365d;">Claim Status Updated</h2>
                    <p>Hello <strong>${initialClaim.client_name}</strong>,</p>
                    <p>The status of your insurance claim has been updated:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
                        <p style="margin: 0;"><strong>Policy Number:</strong> ${initialClaim.policy_no || 'N/A'}</p>
                        <p style="margin: 10px 0 0 0;"><strong>New Status:</strong> <span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 14px; display: inline-block;">${status}</span></p>
                    </div>
                    ${admin_notes ? `
                    <div style="margin-top: 20px; background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <strong>Administrator Notes:</strong>
                        <p style="font-style: italic; color: #92400e; margin-top: 5px; margin-bottom: 0;">"${admin_notes}"</p>
                    </div>` : ''}
                    <p style="margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 20px; color: #718096; font-size: 14px; text-align: center;">
                        This is an automated notification from <strong>Raunak Consultancy</strong>.
                    </p>
                </div>
            `;

            const phone = initialClaim.phone;
            const email = initialClaim.email;

            // 1. WhatsApp Priority
            if (phone) {
                sendWhatsApp(phone, messageText).then(whatsappRes => {
                    if (whatsappRes.success) {
                        console.log('[DEBUG] WhatsApp sent successfully to:', phone);
                    } else {
                        console.warn('[DEBUG] WhatsApp failed, falling back to SMS:', whatsappRes.error);
                        // 2. SMS Fallback
                        sendSMS(phone, messageText).then(smsRes => {
                            if (smsRes.success) {
                                console.log('[DEBUG] SMS sent successfully to:', phone);
                            } else {
                                console.error('[DEBUG] SMS failed too:', smsRes.error);
                            }
                        });
                    }
                });
            }

            // 3. Email Always (as secondary/official record)
            if (email) {
                sendEmail(
                    email,
                    `Claim Update: ${status} (ID: ${id.substring(0, 8)})`,
                    emailHtml
                ).then(res => {
                    if (res.success) {
                        console.log('[DEBUG] Email sent successfully to:', email);
                    } else {
                        console.error('[DEBUG] Failed to send email to client:', res.error);
                    }
                });
            }
        } else {
            console.log('[DEBUG] Status unchanged. Skipping notification.');
        }

        res.json({ message: 'Claim updated', data: data[0], notification_triggered: initialClaim.status !== status });
    } catch (err) {
        console.error('Claim Update Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
