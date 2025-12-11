import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Script pour ajouter la colonne phone à la table users
 */
async function addPhoneColumn() {
    try {
        console.log('🔧 Ajout de la colonne phone à la table users...');

        // Vérifier si la colonne existe déjà
        const [columns] = await sequelize.query(
            "SHOW COLUMNS FROM users LIKE 'phone'",
            { type: QueryTypes.SELECT }
        );

        if (columns) {
            console.log('⏭️  La colonne phone existe déjà');
            return;
        }

        // Ajouter la colonne phone
        await sequelize.query(
            'ALTER TABLE users ADD COLUMN phone VARCHAR(255) NULL AFTER role',
            { type: QueryTypes.RAW }
        );

        console.log('✅ Colonne phone ajoutée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la colonne phone:', error);
        throw error;
    }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    addPhoneColumn()
        .then(() => {
            console.log('✨ Migration terminée avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

export default addPhoneColumn;
