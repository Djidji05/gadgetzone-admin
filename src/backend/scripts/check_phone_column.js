import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function checkPhoneColumn() {
    try {
        console.log('🔍 Vérification de la colonne phone...');

        const columns = await sequelize.query(
            "SHOW COLUMNS FROM users",
            { type: QueryTypes.SELECT }
        );

        console.log('\n📋 Colonnes de la table users:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

        const phoneColumn = columns.find(col => col.Field === 'phone');
        if (phoneColumn) {
            console.log('\n✅ La colonne phone existe!');
        } else {
            console.log('\n❌ La colonne phone n\'existe pas encore');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

checkPhoneColumn();
