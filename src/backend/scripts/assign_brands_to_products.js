import sequelize from '../config/database.js';
import { Product, Brand } from '../models/index.js';

async function assignBrandsToProducts() {
    try {
        console.log('🏷️ Attribution des marques aux produits...');

        // Récupérer toutes les marques
        const brands = await Brand.findAll();

        if (brands.length === 0) {
            console.log('❌ Aucune marque trouvée. Veuillez d\'abord exécuter seed_brands.js');
            return;
        }

        console.log(`✅ ${brands.length} marques trouvées`);

        // Récupérer tous les produits sans marque
        const products = await Product.findAll({
            where: {
                brand_id: null
            }
        });

        console.log(`📦 ${products.length} produits sans marque trouvés`);

        if (products.length === 0) {
            console.log('✅ Tous les produits ont déjà une marque assignée');
            return;
        }

        // Mapper les marques par nom pour une attribution intelligente
        const brandMap = {
            'Apple': brands.find(b => b.name === 'Apple')?.id,
            'Samsung': brands.find(b => b.name === 'Samsung')?.id,
            'Sony': brands.find(b => b.name === 'Sony')?.id,
            'Dell': brands.find(b => b.name === 'Dell')?.id,
            'HP': brands.find(b => b.name === 'HP')?.id,
            'Lenovo': brands.find(b => b.name === 'Lenovo')?.id,
            'Asus': brands.find(b => b.name === 'Asus')?.id,
            'Microsoft': brands.find(b => b.name === 'Microsoft')?.id,
            'Google': brands.find(b => b.name === 'Google')?.id,
            'Xiaomi': brands.find(b => b.name === 'Xiaomi')?.id,
            'Huawei': brands.find(b => b.name === 'Huawei')?.id,
            'LG': brands.find(b => b.name === 'LG')?.id,
            'Canon': brands.find(b => b.name === 'Canon')?.id,
            'Nikon': brands.find(b => b.name === 'Nikon')?.id,
            'Bose': brands.find(b => b.name === 'Bose')?.id,
            'JBL': brands.find(b => b.name === 'JBL')?.id,
        };

        // Attribution intelligente basée sur le nom du produit
        let updated = 0;
        for (const product of products) {
            let assignedBrandId = null;

            // Chercher si le nom du produit contient un nom de marque
            for (const [brandName, brandId] of Object.entries(brandMap)) {
                if (brandId && product.name.toLowerCase().includes(brandName.toLowerCase())) {
                    assignedBrandId = brandId;
                    break;
                }
            }

            // Si aucune marque n'est trouvée, assigner une marque aléatoire
            if (!assignedBrandId) {
                assignedBrandId = brands[Math.floor(Math.random() * brands.length)].id;
            }

            await product.update({ brand_id: assignedBrandId });
            updated++;
            console.log(`✅ Produit "${product.name}" -> Marque ID ${assignedBrandId}`);
        }

        console.log(`\n✅ ${updated} produits mis à jour avec succès!`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'attribution des marques:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

assignBrandsToProducts();
