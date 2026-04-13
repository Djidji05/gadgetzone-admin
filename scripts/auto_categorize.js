import sequelize from '../src/backend/config/database.js';
import { Product, Category, Brand } from '../src/backend/models/index.js';

async function fix() {
    try {
        console.log('--- Classification Auto des Produits (Cat & Brand) ---');
        await sequelize.authenticate();

        const categoryMapping = {
            'iphone': 'smartphone',
            'samsung': 'smartphone',
            'laptop': 'laptop',
            'thinkpad': 'laptop',
            'ordinateur': 'laptop'
        };

        const brandMapping = {
            'iphone': 'Apple',
            'apple': 'Apple',
            'samsung': 'Samsung',
            'lenovo': 'Lenovo',
            'thinkpad': 'Lenovo',
            'hp': 'HP',
            'dell': 'Dell',
            'asus': 'Asus',
            'sony': 'Sony',
            'nimo': 'Lenovo'
        };

        const products = await Product.findAll();
        const categories = await Category.findAll();
        const brands = await Brand.findAll();

        const catMap = new Map(categories.map(c => [c.slug, c.id]));
        const brandMap = new Map(brands.map(b => [b.name, b.id]));

        let count = 0;
        for (const product of products) {
            const name = product.name.toLowerCase();
            let updates = {};

            // Category match
            if (!product.category_id) {
                for (const [kw, slug] of Object.entries(categoryMapping)) {
                    if (name.includes(kw)) {
                        const catId = catMap.get(slug);
                        if (catId) updates.category_id = catId;
                        break;
                    }
                }
            }

            // Brand match
            if (!product.brand_id) {
                for (const [kw, brandName] of Object.entries(brandMapping)) {
                    if (name.includes(kw)) {
                        const brandId = brandMap.get(brandName);
                        if (brandId) updates.brand_id = brandId;
                        break;
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                await product.update(updates);
                console.log(`✅ [${product.id}] ${product.name} Mis à jour :`, updates);
                count++;
            }
        }

        console.log(`\n✨ Fin. ${count} produits mis à jour.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
}

fix();
