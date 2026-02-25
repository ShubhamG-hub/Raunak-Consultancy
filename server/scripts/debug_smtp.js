const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const configs = [
    { name: 'Port 587, STARTTLS, authMethod: LOGIN', host: 'smtp.rediffmail.com', port: 587, secure: false, authMethod: 'LOGIN', tls: { minVersion: 'TLSv1', rejectUnauthorized: false, ciphers: 'DEFAULT@SECLEVEL=0' } },
    { name: 'Port 587, STARTTLS, authMethod: PLAIN', host: 'smtp.rediffmail.com', port: 587, secure: false, authMethod: 'PLAIN', tls: { minVersion: 'TLSv1', rejectUnauthorized: false, ciphers: 'DEFAULT@SECLEVEL=0' } },
    { name: 'Port 587, Rediffmail Pro, authMethod: LOGIN', host: 'smtp.rediffmailpro.com', port: 587, secure: false, authMethod: 'LOGIN', tls: { minVersion: 'TLSv1', rejectUnauthorized: false, ciphers: 'DEFAULT@SECLEVEL=0' } }
];

async function runTests() {
    console.log('🔍 Starting SMTP Diagnostic Tests for Rediffmail...');
    console.log(`User: ${process.env.SMTP_USER}\n`);

    for (const config of configs) {
        console.log(`Testing: ${config.name}...`);
        const transporter = nodemailer.createTransport({
            host: config.host || process.env.SMTP_HOST,
            port: config.port,
            secure: config.secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            authMethod: config.authMethod,
            tls: config.tls || { rejectUnauthorized: false }
        });

        try {
            await transporter.verify();
            console.log('✅ SUCCESS: Connection verified!\n');
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
            if (err.code) console.log(`   Code: ${err.code}`);
            console.log('');
        }
    }
}

runTests();
