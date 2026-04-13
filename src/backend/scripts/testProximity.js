
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3003/api';

async function runTests() {
    try {
        console.log('🧪 Testing GPS Proximity Sorting...');

        // Test 1: Near Paris (Store 8 should be closer)
        console.log('\n📍 --- TEST 1: Near Paris (48.8566, 2.3522) ---');
        await fetchAndLog(48.8566, 2.3522);

        // Test 2: Near Port-au-Prince (Store 22 should be closer)
        console.log('\n📍 --- TEST 2: Near Port-au-Prince (18.5392, -72.3350) ---');
        await fetchAndLog(18.5392, -72.3350);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function fetchAndLog(lat, lng) {
    const response = await axios.get(`${BACKEND_URL}/products/search`, {
        params: { q: 'a', lat, lng, limit: 5 }
    });
    const products = response.data.products || response.data;
    products.forEach((p, i) => {
        const store = p.store || {};
        console.log(`${i+1}. ${p.name.padEnd(20)} | Store ID: ${String(store.id).padEnd(2)} | Name: ${store.name}`);
    });
}

runTests();
