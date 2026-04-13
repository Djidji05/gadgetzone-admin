import sequelize from '../config/database.js';
import Page from '../models/Page.js';

async function createPagesTable() {
    try {
        console.log('🔄 Creating pages table...');

        await Page.sync({ force: false });

        console.log('✅ Pages table created successfully!');

        console.log('📝 Creating sample pages...');

        await Page.bulkCreate([
            {
                title: 'À propos',
                slug: 'about',
                content: 'Contenu de la page À propos...',
                metaTitle: 'À propos de htfasil',
                metaDescription: 'Découvrez htfasil, votre boutique high-tech en Haïti',
                isPublished: true
            },
            {
                title: 'Conditions d\'utilisation',
                slug: 'terms',
                content: 'Conditions d\'utilisation du site...',
                metaTitle: 'Conditions d\'utilisation',
                metaDescription: 'Conditions d\'utilisation de htfasil',
                isPublished: true
            },
            {
                title: 'Politique de confidentialité',
                slug: 'privacy',
                content: 'Notre politique de confidentialité...',
                metaTitle: 'Politique de confidentialité',
                metaDescription: 'Politique de confidentialité de htfasil',
                isPublished: true
            }
        ]);

        console.log('✅ Sample pages created!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating pages table:', error);
        process.exit(1);
    }
}

createPagesTable();
