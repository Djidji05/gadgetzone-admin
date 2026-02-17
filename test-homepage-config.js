import { HomepageConfig } from './src/backend/models/index.js';
import sequelize from './src/backend/config/database.js';

async function checkDuplicates() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const configs = await HomepageConfig.findAll();
        console.log('Total configs:', configs.length);

        const sections = configs.map(c => c.section);
        const uniqueSections = new Set(sections);

        if (sections.length !== uniqueSections.size) {
            console.log('Duplicates found in section!');
            const counts = {};
            sections.forEach(s => counts[s] = (counts[s] || 0) + 1);
            Object.entries(counts).filter(([k, v]) => v > 1).forEach(([k, v]) => console.log(`${k}: ${v}`));
        } else {
            console.log('No duplicates found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkDuplicates();
