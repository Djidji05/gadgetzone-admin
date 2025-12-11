import sequelize from '../config/database.js';
import Brand from '../models/Brand.js';

const brands = [
    { name: 'Apple', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', description: 'Innovation et design.' },
    { name: 'Samsung', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', description: 'Technologie de pointe.' },
    { name: 'Sony', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Sony_logo.svg', description: 'Audio et vidéo premium.' },
    { name: 'HP', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg', description: 'Ordinateurs et imprimantes.' },
    { name: 'Dell', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg', description: 'Solutions informatiques.' },
    { name: 'Logitech', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg', description: 'Périphériques de qualité.' },
    { name: 'Canon', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Canon_logo_vector.svg', description: 'Photographie et image.' },
    { name: 'Nikon', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Nikon_Logo.svg', description: 'Optique de précision.' },
    { name: 'Microsoft', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', description: 'Logiciels et hardware.' },
    { name: 'Asus', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', description: 'Gaming et performance.' }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        for (const brand of brands) {
            const [instance, created] = await Brand.findOrCreate({
                where: { name: brand.name },
                defaults: brand
            });
            if (created) {
                console.log(`Brand ${brand.name} created.`);
            } else {
                console.log(`Brand ${brand.name} already exists.`);
            }
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
