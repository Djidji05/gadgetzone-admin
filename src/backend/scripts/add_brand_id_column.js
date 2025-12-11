import sequelize from '../config/database.js';

async function addBrandIdColumn() {
    try {
        console.log('🔧 Vérification de la colonne brand_id dans la table products...');

        // Vérifier si la colonne existe
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='brand_id';
    `);

        if (results.length > 0) {
            console.log('✅ La colonne brand_id existe déjà dans la table products');
            return;
        }

        console.log('➕ Ajout de la colonne brand_id à la table products...');

        // Ajouter la colonne brand_id
        await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN brand_id INTEGER REFERENCES brands(id);
    `);

        console.log('✅ Colonne brand_id ajoutée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la colonne brand_id:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

addBrandIdColumn();
