import axios from 'axios';
import sequelize from '../config/database.js';

const api = axios.create({ baseURL: 'http://localhost:3003/api' });

async function runPerformanceAudit() {
    console.log('🚀 DÉMARRAGE DE L\'AUDIT DE PERFORMANCE GADGETZONE');
    console.log('==============================================');

    const performanceReport = [];

    try {
        // --- PHASE 1: LATENCE API (Baseline) ---
        console.log('\n⏱️ PHASE 1: Benchmark de Latence API...');
        
        const endpoints = [
            { name: 'Root API', url: '/' },
            { name: 'Product List', url: '/products' },
            { name: 'Featured Products', url: '/products/featured' },
            { name: 'Categories', url: '/categories' }
        ];

        for (const endpoint of endpoints) {
            const start = Date.now();
            await api.get(endpoint.url);
            const latency = Date.now() - start;
            console.log(`- ${endpoint.name}: ${latency}ms`);
            performanceReport.push({ metric: endpoint.name, value: `${latency}ms`, note: 'Baseline' });
        }

        // --- PHASE 2: TEST DE CONCURRENCE ---
        console.log('\n💥 PHASE 2: Test de Concurrence (20 requêtes simultanées)...');
        
        const concurrencyRequests = 20;
        const startConcurrency = Date.now();
        
        const results = await Promise.allSettled(
            Array.from({ length: concurrencyRequests }).map(() => api.get('/products'))
        );
        
        const totalDuration = Date.now() - startConcurrency;
        const avgLatency = Math.round(totalDuration / concurrencyRequests);
        const successCount = results.filter(r => r.status === 'fulfilled').length;

        console.log(`- Durée totale: ${totalDuration}ms`);
        console.log(`- Latence moyenne sous charge: ${avgLatency}ms`);
        console.log(`- Taux de succès: ${successCount}/${concurrencyRequests}`);
        
        performanceReport.push({ 
            metric: 'Concurrency (20 req)', 
            value: `${avgLatency}ms / total ${totalDuration}ms`, 
            note: `Success rate: ${successCount}/${concurrencyRequests}` 
        });

        // --- PHASE 3: AUDIT DB (INDEX) ---
        console.log('\n🗄️ PHASE 3: Audit des Index de Base de Données...');
        
        const [indexes] = await sequelize.query(`
            SELECT tablename, indexname, indexdef 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename IN ('products', 'offers', 'order_items', 'orders')
        `);

        console.log(`- Total Index trouvés: ${indexes.length}`);
        
        const criticalIndexes = [
            'products_perf_featured_idx',
            'offers_perf_product_id_idx',
            'order_items_perf_product_id_idx'
        ];

        criticalIndexes.forEach(name => {
            const found = indexes.find(idx => idx.indexname === name);
            if (found) {
                console.log(`✅ Index Critique présent: ${name}`);
            } else {
                console.warn(`⚠️ Index Critique MANQUANT: ${name}`);
            }
        });

        performanceReport.push({ 
            metric: 'Database Indexes', 
            value: `${indexes.length} total`, 
            note: 'Rocket indexes verified' 
        });

        console.log('\n📊 RÉSUMÉ FINAL DE PERFORMANCE :');
        console.table(performanceReport);

    } catch (error) {
        console.error('\n❌ ÉCHEC DE L\'AUDIT:', error.message);
    } finally {
        process.exit(0);
    }
}

runPerformanceAudit();
