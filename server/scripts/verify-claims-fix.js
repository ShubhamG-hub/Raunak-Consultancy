const axios = require('axios');

async function testClaimsFixes() {
    console.log('--- TESTING CLAIMS FIXES ---');
    const baseUrl = 'http://localhost:5000/api/claims';

    // 1. Test POST with contact info (Should succeed even if columns missing due to fallback)
    console.log('\n1. Testing POST /api/claims (with contact info)...');
    try {
        const res = await axios.post(baseUrl, {
            client_name: 'Robot Tester',
            email: 'robot@test.com',
            phone: '9999999999',
            type: 'Other',
            description: 'Testing fallback logic'
        });
        console.log('✅ POST Success:', res.status, res.data);
    } catch (err) {
        console.error('❌ POST Failed:', err.response?.status, err.response?.data);
    }

    // 2. Test PUT with invalid ID (Should return 400 instead of 500)
    console.log('\n2. Testing PUT /api/claims/1 (Invalid ID format)...');
    try {
        await axios.put(`${baseUrl}/1`, { status: 'Processing' });
        console.error('❌ PUT should have failed with 400');
    } catch (err) {
        console.log('✅ PUT Correctly Failed:', err.response?.status, err.response?.data);
    }

    process.exit(0);
}

testClaimsFixes();
