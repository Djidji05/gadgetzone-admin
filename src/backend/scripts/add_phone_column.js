import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addPhoneColumn() {
    let connection;

    try {
        console.log('🔧 Connexion à la base de données...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gadgetzone'
        });

        console.log('✅ Connecté à la base de données');

        // Vérifier si la colonne existe
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM users WHERE Field = 'phone'"
        );

        if (columns.length > 0) {
            console.log('⏭️  La colonne phone existe déjà');
            return;
        }

        console.log('📝 Ajout de la colonne phone...');

        // Ajouter la colonne
        await connection.query(
            'ALTER TABLE users ADD COLUMN phone VARCHAR(255) NULL AFTER role'
        );

        console.log('✅ Colonne phone ajoutée avec succès!');

        // Vérifier que la colonne a bien été ajoutée
        const [allColumns] = await connection.query('SHOW COLUMNS FROM users');
        console.log('\n📋 Colonnes de la table users:');
        allColumns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
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
