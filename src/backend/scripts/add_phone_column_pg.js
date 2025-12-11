import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function addPhoneColumn() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gadgetzone'
    });

    try {
        console.log('🔧 Connexion à PostgreSQL...');
        await client.connect();
        console.log('✅ Connecté à la base de données');

        // Vérifier si la colonne existe
        const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `;

        const result = await client.query(checkQuery);

        if (result.rows.length > 0) {
            console.log('⏭️  La colonne phone existe déjà');
            return;
        }

        console.log('📝 Ajout de la colonne phone...');

        // Ajouter la colonne
        await client.query('ALTER TABLE users ADD COLUMN phone VARCHAR(255)');

        console.log('✅ Colonne phone ajoutée avec succès!');

        // Vérifier toutes les colonnes
        const columnsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

        const columns = await client.query(columnsQuery);
        console.log('\n📋 Colonnes de la table users:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée');
    }
}

addPhoneColumn()
    .then(() => {
        console.log('\n✨ Migration terminée avec succès!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Échec de la migration');
        process.exit(1);
    });
