import axios from 'axios';
const api = axios.create({ baseURL: 'http://127.0.0.1:3003/api' });

const endpoints = [
  { name: 'Root', path: '' }, // Empty path for /api
  { name: 'Health', path: '/health' },

  { name: 'Featured Products', path: '/products/featured' },
  { name: 'Brands', path: '/brands' },
  { name: 'Banners', path: '/promotions/banners' },

  { name: 'Search (Empty)', path: '/products' }
];

async function runBenchmark() {
  console.log('🚀 Starting Comprehensive Benchmark...\n');
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const res = await api.get(endpoint.path);
      const latency = Date.now() - start;
      console.log(`📍 Endpoint: ${endpoint.name.padEnd(20)} | Latency: ${latency.toString().padStart(5)}ms | Status: ${res.status}`);
    } catch (err) {
      console.log(`📍 Endpoint: ${endpoint.name.padEnd(20)} | ❌ ERROR: ${err.response?.data?.message || err.message || err}`);
    }

  }
  console.log('\n🏁 Benchmark Finished.');
}

async function start() {
    console.log('--- ITERATION 1 (Cold Cache) ---');
    await runBenchmark();
    console.log('\n--- ITERATION 2 (Warm Cache) ---');
    await runBenchmark();
}

start();

