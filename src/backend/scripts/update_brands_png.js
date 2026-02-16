import sequelize from '../config/database.js';
import Brand from '../models/Brand.js';

async function updateBrands() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // 1. Update Canon
        await Brand.update(
            { logo_url: '/images/brands/canon.png' },
            { where: { name: 'Canon' } }
        );
        console.log('Updated Canon logo to .png');

        // 2. Update Lenovo
        await Brand.update(
            { name: 'Lenovo', logo_url: '/images/brands/lenovo.png', description: 'Leader mondial des PC.' },
            { where: { name: 'Lenovo' } }
        );
        console.log('Updated Lenovo logo to .png');

        // 3. Update Samsung
        await Brand.update(
            { name: 'Samsung', logo_url: '/images/brands/samsung.png', description: 'Électronique et mobiles.' },
            { where: { name: 'Samsung' } }
        );
        console.log('Updated Samsung logo to .png');

        console.log('Brand updates (PNG) completed.');

    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        await sequelize.close();
    }
}

updateBrands();
