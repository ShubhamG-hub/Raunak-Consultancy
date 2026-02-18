const { sendWhatsApp, sendSMS } = require('../config/sms');
require('dotenv').config();

const testNotifications = async () => {
    const testNumber = process.env.TEST_PHONE_NUMBER || '+919137105476'; // Fallback to provided number for internal check
    const message = "Test notification from Raunak Consultancy. Verification in progress.";

    console.log('--- Twilio Integration Test ---');
    console.log(`Target Number: ${testNumber}`);

    console.log('\nTesting WhatsApp...');
    const waResult = await sendWhatsApp(testNumber, message);
    console.log('WhatsApp Result:', waResult);

    console.log('\nTesting SMS...');
    const smsResult = await sendSMS(testNumber, message);
    console.log('SMS Result:', smsResult);

    console.log('\n--- Test Complete ---');
    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.log('NOTE: Twilio credentials not found in .env. Falling back to debug mode.');
    }
};

testNotifications().catch(err => console.error('Test failed:', err));
