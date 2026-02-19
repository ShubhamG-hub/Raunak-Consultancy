const supabase = require('../config/supabase');

async function testBookingInsert() {
    console.log('--- Testing Booking Insertion ---');
    const testData = {
        name: 'Test Customer',
        phone: '1234567890',
        email: 'test@example.com',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        service_type: 'Investment Planning',
        message: 'This is a test booking from the diagnostic script.'
    };

    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([testData])
            .select();

        if (error) {
            console.error('Insert Failed:', error.message);
            if (error.message.includes('relation "bookings" does not exist')) {
                console.log('HINT: You still need to run the SQL script in Supabase!');
            }
        } else {
            console.log('Insert Successful!');
            console.log('Inserted Data:', data);

            // Cleanup: Delete the test booking
            const { error: deleteError } = await supabase
                .from('bookings')
                .delete()
                .eq('id', data[0].id);

            if (deleteError) {
                console.error('Cleanup Failed:', deleteError.message);
            } else {
                console.log('Cleanup Successful (Test data removed).');
            }
        }
    } catch (err) {
        console.error('Fatal Error:', err.message);
    }
    process.exit(0);
}

testBookingInsert();
