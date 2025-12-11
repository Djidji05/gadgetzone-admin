import sequelize from '../config/database.js';
import Campaign from '../models/Campaign.js';

async function createCampaignsTable() {
    try {
        console.log('🔄 Creating campaigns table...');

        // Force sync to create the table
        await Campaign.sync({ force: false });

        console.log('✅ Campaigns table created successfully!');

        // Create some sample data
        console.log('📝 Creating sample campaigns...');

        await Campaign.bulkCreate([
            {
                name: 'Soldes d\'été 2024',
                type: 'Email',
                status: 'Active',
                description: 'Campagne de soldes d\'été avec réductions jusqu\'à 50%',
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-08-31'),
                budget: 5000,
                spent: 3200,
                leads: 450,
                conversions: 89,
                revenue: 12500
            },
            {
                name: 'Black Friday 2024',
                type: 'Social Media',
                status: 'Draft',
                description: 'Préparation de la campagne Black Friday',
                startDate: new Date('2024-11-24'),
                endDate: new Date('2024-11-27'),
                budget: 10000,
                spent: 0,
                leads: 0,
                conversions: 0,
                revenue: 0
            },
            {
                name: 'Newsletter Nouveaux Produits',
                type: 'Newsletter',
                status: 'Active',
                description: 'Campagne mensuelle pour promouvoir les nouveaux produits',
                budget: 1500,
                spent: 1200,
                leads: 320,
                conversions: 45,
                revenue: 6800
            }
        ]);

        console.log('✅ Sample campaigns created!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating campaigns table:', error);
        process.exit(1);
    }
}

createCampaignsTable();
