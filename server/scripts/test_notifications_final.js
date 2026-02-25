const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const notificationService = require('../services/notificationService');

async function verifyAll() {
    console.log('🚀 Final Verification of Email Notification System...');

    const sampleBooking = {
        id: 'test-booking-uuid',
        name: 'Test Client',
        email: process.env.SMTP_USER, // Send to self for verification
        service_type: 'Investment Planning',
        date: '2026-03-10',
        time: '10:30 AM'
    };

    const sampleClaim = {
        client_name: 'Test Claimant',
        email: process.env.SMTP_USER,
        type: 'Life Insurance',
        policy_no: 'POL-999888'
    };

    try {
        console.log('\n1. Testing sendFormSubmissionEmails (General)...');
        await notificationService.sendFormSubmissionEmails(sampleBooking, 'Test Form');
        console.log('✅ sendFormSubmissionEmails triggered.');

        console.log('\n2. Testing sendMeetingStartEmail...');
        await notificationService.sendMeetingStartEmail(sampleBooking, 'test-token');
        console.log('✅ sendMeetingStartEmail triggered.');

        console.log('\n3. Testing sendBookingStatusUpdateEmail...');
        await notificationService.sendBookingStatusUpdateEmail(sampleBooking, 'Confirmed', 'http://localhost:5173/zoom');
        console.log('✅ sendBookingStatusUpdateEmail triggered.');

        console.log('\n4. Testing sendClaimStatusUpdateEmail...');
        await notificationService.sendClaimStatusUpdateEmail(sampleClaim, 'Approved', 'Your claim has been verified.');
        console.log('✅ sendClaimStatusUpdateEmail triggered.');

        console.log('\n5. Testing sendRecordingEmail...');
        await notificationService.sendRecordingEmail(sampleBooking, 'http://zoom.us/recording');
        console.log('✅ sendRecordingEmail triggered.');

        console.log('\n🏁 All notification functions verified for runtime correctness.');
    } catch (err) {
        console.error('❌ Verification failed:', err);
        process.exit(1);
    }
    process.exit(0);
}

verifyAll();
