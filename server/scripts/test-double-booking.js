const axios = require('axios');
const API_URL = 'http://localhost:5000/api';


async function testDoubleBooking() {
    console.log('--- Testing Double Booking Prevention ---');
    const bookingData = {
        name: 'Test Customer',
        phone: '1234567890',
        date: '2026-12-25',
        time: '10:00 AM',
        service_type: 'Investment Planning'
    };

    try {
        console.log('Attempting First Booking...');
        const res1 = await axios.post(`${API_URL}/bookings`, bookingData);
        console.log('First Booking Status:', res1.status, res1.data.message);

        console.log('Attempting Second Booking for Same Slot...');
        try {
            await axios.post(`${API_URL}/bookings`, bookingData);
            console.log('ERROR: Second booking should have failed!');
        } catch (error) {
            console.log('Second Booking Failed as Expected:', error.response?.status, error.response?.data?.error);
        }

        // Cleanup: Manual deletion via API if possible or just log it
        console.log('Please delete the test booking with date 2026-12-25 manually if needed.');
    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

testDoubleBooking();
