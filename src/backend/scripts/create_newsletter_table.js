import sequelize from '../config/database.js';
import Newsletter from '../models/Newsletter.js';

async function createNewsletterTable() {
    try {
        console.log('🔄 Creating newsletters table...');

        // Force sync to create the table
        await Newsletter.sync({ force: false });

        console.log('✅ Newsletters table created successfully!');

        // Create some sample data
        console.log('📝 Creating sample newsletter subscribers...');

        await Newsletter.bulkCreate([
            {
                email: 'jean.dupont@example.com',
                isActive: true,
                subscribedAt: new Date('2024-11-01')
            },
            {
                email: 'marie.martin@example.com',
                isActive: true,
                subscribedAt: new Date('2024-11-15')
            },
            {
                email: 'pierre.durand@example.com',
                isActive: true,
                subscribedAt: new Date('2024-12-01')
            },
            {
                email: 'sophie.bernard@example.com',
                isActive: true,
                subscribedAt: new Date('2024-12-05')
            },
            {
                email: 'old.subscriber@example.com',
                isActive: false,
                subscribedAt: new Date('2024-10-01'),
                unsubscribedAt: new Date('2024-11-20')
            }
        ]);

        console.log('✅ Sample newsletter subscribers created!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating newsletters table:', error);
        process.exit(1);
    }
}

createNewsletterTable();
