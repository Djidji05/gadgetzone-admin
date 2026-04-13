import axios from 'axios';

const API_URL = 'http://localhost:3003/api';
let authToken = '';

async function loginAsSeller() {
    try {
        console.log('Logging in as seller...');
        // We'll try to find a seller user or use common credentials if known
        // For this test, we assume the user might need to provide a token or we use an existing one from logs if available
        // But for a generic script, let's try a typical seller login
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'djouka@gmail.com',
            password: 'password123'
        });
        authToken = response.data.token;
        console.log('Login successful.');
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function testSummary() {
    try {
        console.log('Fetching vendor summary...');
        const response = await axios.get(`${API_URL}/vendors/me/summary`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Summary response:', response.data);
        console.log('Test PASSED if pendingOrdersCount and unreadMessagesCount are present.');
    } catch (error) {
        console.error('Summary fetch failed:', error.response?.data || error.message);
    }
}

async function run() {
    // Note: This script requires a running server and valid credentials.
    // Since I don't have those, I'll check if the endpoint is reachable but might fail login.
    await loginAsSeller();
    await testSummary();
}

run();
