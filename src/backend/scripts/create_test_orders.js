import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function createTestOrders() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'htfasil'
    });

    try {
        await client.connect();
        console.log('✅ Connecté à PostgreSQL');

        // Vérifier s'il y a déjà des commandes livrées
        const existingOrders = await client.query(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'
    `);

        console.log(`📦 Commandes livrées existantes: ${existingOrders.rows[0].count}`);

        if (parseInt(existingOrders.rows[0].count) > 0) {
            console.log('✅ Des commandes livrées existent déjà !');
            return;
        }

        console.log('📝 Création de commandes de test...');

        // Récupérer des utilisateurs et produits existants
        const users = await client.query('SELECT id FROM users LIMIT 5');
        const products = await client.query('SELECT id, price FROM products LIMIT 10');

        if (users.rows.length === 0) {
            console.log('❌ Aucun utilisateur trouvé. Créez d\'abord des utilisateurs.');
            return;
        }

        if (products.rows.length === 0) {
            console.log('❌ Aucun produit trouvé. Créez d\'abord des produits.');
            return;
        }

        // Créer 20 commandes de test
        for (let i = 0; i < 20; i++) {
            const user = users.rows[Math.floor(Math.random() * users.rows.length)];
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 produits par commande

            let totalAmount = 0;
            const orderItems = [];

            for (let j = 0; j < numItems; j++) {
                const product = products.rows[Math.floor(Math.random() * products.rows.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = parseFloat(product.price);

                orderItems.push({
                    product_id: product.id,
                    quantity,
                    price
                });

                totalAmount += price * quantity;
            }

            // Date aléatoire dans les 60 derniers jours
            const daysAgo = Math.floor(Math.random() * 60);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);

            // Statuts possibles
            const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            // Créer la commande
            const orderResult = await client.query(`
        INSERT INTO orders (user_id, total_amount, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $4)
        RETURNING id
      `, [user.id, totalAmount, status, orderDate]);

            const orderId = orderResult.rows[0].id;

            // Créer les items de commande
            for (const item of orderItems) {
                await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $5)
        `, [orderId, item.product_id, item.quantity, item.price, orderDate]);
            }

            console.log(`✅ Commande #${orderId} créée - ${status} - ${totalAmount.toFixed(2)} HTG`);
        }

        // Afficher le résumé
        const summary = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM orders
      GROUP BY status
    `);

        console.log('\n📊 Résumé des commandes:');
        summary.rows.forEach(row => {
            console.log(`  - ${row.status}: ${row.count} commandes, ${parseFloat(row.total).toLocaleString()} HTG`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée');
    }
}

createTestOrders()
    .then(() => {
        console.log('\n✨ Commandes de test créées avec succès!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Échec de la création des commandes');
        process.exit(1);
    });
