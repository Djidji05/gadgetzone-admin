import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3003/api';

const endpoints = [
  { name: 'Admin Overview', url: '/stats/overview' },
  { name: 'Notifications Count', url: '/stats/notifications-count' },
  { name: 'Public Products (All)', url: '/products' },
  { name: 'New Arrivals', url: '/products/new' },
  { name: 'Featured Products', url: '/products/featured' },
  { name: 'Categories List', url: '/categories' },
  { name: 'Search (Laptop)', url: '/products/search?q=laptop' },
  { name: 'Vendor Recent Actions', url: '/admin/vendors/recent-actions' }
];

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@gadgetzone.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Échec du login admin:', error.response ? error.response.status : 'ERR', error.message);
    if (error.response) console.error('Data:', error.response.data);
    return null;
  }
}

async function runBenchmark() {
  console.log('🚀 Démarrage du Speed Test Global...');
  const token = await login();
  if (token) console.log('✅ Authentifié en tant qu\'admin');
  console.log('-------------------------------------------');
  
  const results = [];
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name.padEnd(25)}... `);
    
    const start = performance.now();
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, { 
        ...config,
        timeout: 10000 
      });
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      
      console.log(`✅ ${duration}ms (${response.status})`);
      results.push({ ...endpoint, duration: parseFloat(duration), status: 'SUCCESS' });
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      const status = error.response ? error.response.status : 'ERR';
      console.log(`❌ FAILED in ${duration}ms (Status: ${status}) - ${error.message}`);
      results.push({ ...endpoint, duration: parseFloat(duration), status: 'FAILED', code: status });
    }
  }

  console.log('-------------------------------------------');
  console.log('📊 RÉSUMÉ DU BENCHMARK');
  console.log('-------------------------------------------');
  
  const sorted = [...results].sort((a, b) => b.duration - a.duration);
  
  sorted.forEach(r => {
    const statusIcon = r.status === 'SUCCESS' ? '🟢' : '🔴';
    console.log(`${statusIcon} ${r.name.padEnd(25)} : ${r.duration}ms`);
  });
}

runBenchmark().catch(console.error);
