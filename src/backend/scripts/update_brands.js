import sequelize from '../config/database.js';
import Brand from '../models/Brand.js';

async function updateBrands() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // 1. Update Canon (ID 7 usually)
        await Brand.update(
            { logo_url: '/images/brands/canon.jpg' },
            { where: { name: 'Canon' } }
        );
        console.log('Updated Canon logo.');

        // 2. Update Logitech to Lenovo (ID 6 usually)
        await Brand.update(
            { name: 'Lenovo', logo_url: '/images/brands/lenovo.jpg', description: 'Leader mondial des PC.' },
            { where: { name: 'Logitech' } }
        );
        console.log('Updated Logitech to Lenovo.');

        // 3. Handle duplicate Samsung issue.
        // We first find the existing Samsung and rename it to Xiaomi.
        const existingSamsung = await Brand.findOne({ where: { name: 'Samsung' } });
        if (existingSamsung) {
            await existingSamsung.update({
                name: 'Xiaomi',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg',
                description: 'Smartphones et IoT.'
            });
            console.log('Renamed existing Samsung to Xiaomi.');
        }

        // 4. Now we can safely rename Nikon to Samsung.
        await Brand.update(
            { name: 'Samsung', logo_url: '/images/brands/samsung.jpg', description: 'Électronique et mobiles.' },
            { where: { name: 'Nikon' } }
        );
        console.log('Updated Nikon to Samsung.');

        console.log('Brand updates completed.');

    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        await sequelize.close();
    }
}

updateBrands();
