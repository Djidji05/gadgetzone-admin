
import { User } from '../models/index.js';
import sequelize from '../config/database.js';
import fs from 'fs';

const debugUsers = async () => {
    try {
        console.log('🔍 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('📝 Fetching all users...');
        const users = await User.findAll();

        console.log(`📊 Total users found: ${users.length}`);

        const dumpPath = './users_dump.json';
        fs.writeFileSync(dumpPath, JSON.stringify(users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            roleType: typeof u.role
        })), null, 2));

        console.log(`✅ Users dumped to ${dumpPath}`);

    } catch (error) {
        console.error('❌ Error debugging users:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

debugUsers();
