import sequelize from '../src/backend/config/database.js';
import { Category } from '../src/backend/models/index.js';

async function test() {
    try {
        console.log('--- Debug Résolution IDs Catégories ---');
        await sequelize.authenticate();
        
        const categorySlug = 'high-tech';
        const parent = await Category.findOne({ where: { slug: categorySlug } });
        
        if (!parent) {
            console.error('Parent non trouvé');
            process.exit(1);
        }
        
        const categoryId = parent.id;
        console.log(`Parent: ${parent.name}, ID: ${categoryId}`);
        
        // Simulating Repository logic
        const subCategories = await Category.findAll({
            where: { parentId: categoryId },
            attributes: ['id', 'name']
        });
        
        console.log('Sous-catégories trouvées:', subCategories.map(c => `${c.name} (${c.id})`));
        
        const subCategoryIds = subCategories.map(c => c.id);
        const allCategoryIds = [categoryId, ...subCategoryIds];
        
        console.log('Liste finale des IDs pour le filtre IN:', allCategoryIds);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
}

test();
