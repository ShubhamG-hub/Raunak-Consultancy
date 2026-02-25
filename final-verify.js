const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const API_URL = 'http://localhost:5001/api';

const endpoints = [
    '/settings/active_theme',
    '/certificates/public',
    '/awards',
    '/testimonials/public'
];

async function verifyEndpoints() {
    console.log('--- FINAL ENDPOINT VERIFICATION ---');
    console.log('Targeting:', API_URL);
    for (const endpoint of endpoints) {
        try {
            const res = await axios.get(API_URL + endpoint);
            console.log(`✅ ${endpoint}: SUCCESS (${res.status}) - Data count: ${Array.isArray(res.data) ? res.data.length : 'N/A'}`);
        } catch (err) {
            console.log(`❌ ${endpoint}: FAILED (${err.response?.status || err.message})`);
            if (err.response?.data) console.log('   Error Detail:', JSON.stringify(err.response.data));
        }
    }
}

verifyEndpoints();
