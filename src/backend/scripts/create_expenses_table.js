import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function createExpensesTable() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gadgetzone'
    });

    try {
        await client.connect();
        console.log('✅ Connecté à PostgreSQL');

        // Vérifier si la table existe
        const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'expenses'
      );
    `);

        if (checkTable.rows[0].exists) {
            console.log('⏭️  La table expenses existe déjà');
            return;
        }

        console.log('📝 Création de la table expenses...');

        // Créer la table
        await client.query(`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        notes TEXT,
        recurring BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('✅ Table expenses créée avec succès!');

        // Ajouter quelques dépenses de test
        console.log('📝 Ajout de dépenses de test...');

        await client.query(`
      INSERT INTO expenses (category, description, amount, date, payment_method, notes, recurring, status)
      VALUES 
        ('salaires', 'Paiement équipe développement', 45000, '2024-12-01', 'transfer', 'Salaires mensuels', true, 'completed'),
        ('marketing', 'Campagne Facebook Ads', 12000, '2024-12-05', 'card', 'Publicité en ligne', false, 'completed'),
        ('operations', 'Fournitures bureau', 5500, '2024-12-03', 'cash', 'Papeterie et matériel', false, 'completed'),
        ('technologie', 'Serveur cloud AWS', 8500, '2024-12-01', 'card', 'Hébergement mensuel', true, 'completed'),
        ('loyer', 'Loyer bureau', 25000, '2024-12-01', 'transfer', 'Loyer mensuel', true, 'completed'),
        ('utilities', 'Électricité et internet', 7500, '2024-12-05', 'transfer', 'Services publics', false, 'completed'),
        ('marketing', 'Google Ads', 15000, '2024-11-28', 'card', 'Campagne search', false, 'completed'),
        ('fournitures', 'Matériel informatique', 18000, '2024-11-25', 'card', 'Claviers et souris', false, 'completed')
    `);

        console.log('✅ Dépenses de test ajoutées!');

        // Afficher le résumé
        const summary = await client.query(`
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount
      FROM expenses
    `);

        console.log('\n📊 Résumé:');
        console.log(`  - Nombre de dépenses: ${summary.rows[0].total_expenses}`);
        console.log(`  - Montant total: ${parseFloat(summary.rows[0].total_amount).toLocaleString()} HTG`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée');
    }
}

createExpensesTable()
    .then(() => {
        console.log('\n✨ Migration terminée avec succès!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Échec de la migration');
        process.exit(1);
    });
