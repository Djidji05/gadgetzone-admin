import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkUserPhone() {
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

        // Récupérer les derniers utilisateurs avec leur téléphone
        const result = await client.query(`
      SELECT id, name, email, phone, created_at 
      FROM users 
      WHERE role = 'user'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

        console.log('\n📋 Derniers clients enregistrés:');
        result.rows.forEach(user => {
            console.log(`\n  ID: ${user.id}`);
            console.log(`  Nom: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Téléphone: ${user.phone || 'Non renseigné'}`);
            console.log(`  Date: ${user.created_at}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await client.end();
    }
}

checkUserPhone();
