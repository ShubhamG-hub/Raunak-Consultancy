require('dotenv').config();
const notificationService = require('./services/notificationService');

async function testNotifications() {
    console.log('🚀 Starting Email Notification Verification...');

    const testData = {
        name: 'John Doe',
        email: 'shubhamparekh930@gmail.com', // Sending to a real-ish looking email for testing
        phone: '9137105476',
        requirement: 'Financial Planning for 2026',
        type: 'Mutual Funds',
        date: '2026-03-01',
        time: '11:00 AM',
        service_type: 'Investment Consultation',
        policy_no: 'POL12345678',
        amount: 50000,
        description: 'Test claim description',
        content: 'This is a test review for the website. Excellent service!',
        rating: 5
    };

    const forms = [
        { data: { name: testData.name, email: testData.email, phone: testData.phone, type: 'contact' }, name: 'Contact Form' },
        { data: { name: testData.name, email: testData.email, phone: testData.phone, type: 'consultation', requirement: testData.requirement }, name: 'Service Consultation Form' },
        { data: { name: testData.name, email: testData.email, phone: testData.phone, date: testData.date, time: testData.time, service_type: testData.service_type }, name: 'Meeting Booking Form' },
        { data: { client_name: testData.name, email: testData.email, phone: testData.phone, policy_no: testData.policy_no, type: 'Health Insurance', amount: testData.amount, description: testData.description }, name: 'Insurance Claim Form' },
        { data: { name: testData.name, email: testData.email, content: testData.content, rating: testData.rating }, name: 'Testimonial Submission Form' }
    ];

    for (const form of forms) {
        console.log(`\n--- Testing: ${form.name} ---`);
        try {
            await notificationService.sendFormSubmissionEmails(form.data, form.name);
            console.log(`✅ ${form.name} email triggered successfully.`);
        } catch (err) {
            console.error(`❌ ${form.name} email failed:`, err.message);
        }
    }

    console.log('\n🏁 Verification completed. Please check your SMTP logs or Mailtrap for results.');
    process.exit(0);
}

testNotifications();
