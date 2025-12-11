import sequelize from '../config/database.js';
import BlogPost from '../models/BlogPost.js';

async function createBlogTable() {
    try {
        console.log('🔄 Creating blog_posts table...');

        await BlogPost.sync({ force: false });

        console.log('✅ Blog posts table created successfully!');

        console.log('📝 Creating sample blog posts...');

        await BlogPost.bulkCreate([
            {
                title: 'Les tendances e-commerce 2024',
                slug: 'tendances-ecommerce-2024',
                excerpt: 'Découvrez les dernières tendances du commerce en ligne pour cette année',
                content: 'Contenu complet de l\'article sur les tendances e-commerce...',
                author: 'Admin',
                status: 'published',
                views: 245,
                publishedAt: new Date('2024-12-08')
            },
            {
                title: 'Guide d\'optimisation SEO',
                slug: 'guide-optimisation-seo',
                excerpt: 'Comment améliorer le référencement de votre boutique en ligne',
                content: 'Guide complet pour optimiser le SEO...',
                author: 'Admin',
                status: 'published',
                views: 189,
                publishedAt: new Date('2024-12-05')
            },
            {
                title: 'Nouveautés produits',
                slug: 'nouveautes-produits',
                excerpt: 'Présentation de nos nouveaux produits high-tech',
                content: 'Découvrez nos dernières nouveautés...',
                author: 'Admin',
                status: 'draft',
                views: 0
            }
        ]);

        console.log('✅ Sample blog posts created!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating blog table:', error);
        process.exit(1);
    }
}

createBlogTable();
