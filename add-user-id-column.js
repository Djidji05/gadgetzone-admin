import sequelize from './src/backend/config/database.js';

async function addUserIdColumn() {
    try {
        console.log('🔧 Adding user_id column to stores table...');

        // Add the user_id column
        await sequelize.query(`
            ALTER TABLE stores 
            ADD COLUMN IF NOT EXISTS user_id INTEGER;
        `);

        console.log('✅ Column user_id added');

        // Add foreign key constraint
        await sequelize.query(`
            ALTER TABLE stores 
            ADD CONSTRAINT fk_stores_user 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE;
        `);

        console.log('✅ Foreign key constraint added');

        // Update existing stores with user IDs (assign to first 5 users)
        const [users] = await sequelize.query('SELECT id FROM users WHERE role = \'user\' LIMIT 5');
        const [stores] = await sequelize.query('SELECT id FROM stores ORDER BY id LIMIT 5');

        for (let i = 0; i < Math.min(stores.length, users.length); i++) {
            await sequelize.query(`
                UPDATE stores 
                SET user_id = ${users[i].id} 
                WHERE id = ${stores[i].id}
            `);
            console.log(`✅ Store ${stores[i].id} assigned to user ${users[i].id}`);
        }

        // Make user_id NOT NULL
        await sequelize.query(`
            ALTER TABLE stores 
            ALTER COLUMN user_id SET NOT NULL;
        `);

        console.log('✅ Column user_id set to NOT NULL');

        // Add unique constraint
        await sequelize.query(`
            ALTER TABLE stores 
            ADD CONSTRAINT unique_user_store UNIQUE (user_id);
        `);

        console.log('✅ Unique constraint added (one store per user)');

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        await sequelize.close();
    }
}

addUserIdColumn();
