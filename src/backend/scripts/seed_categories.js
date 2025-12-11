import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'gadgetzone',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false
    }
);

const categories = [
    // Smartphones
    { name: 'Smartphones', description: 'Téléphones mobiles et smartphones' },
    { name: 'Écrans téléphone', description: 'Écrans de remplacement pour smartphones' },
    { name: 'Batteries smartphone', description: 'Batteries de remplacement' },
    { name: 'Chargeurs & câbles', description: 'Chargeurs, câbles USB, adaptateurs' },
    { name: 'Coques & protection', description: 'Coques, étuis et verres trempés' },

    // Laptops
    { name: 'Laptops', description: 'Ordinateurs portables' },
    { name: 'Écran laptop', description: 'Écrans pour ordinateurs portables' },
    { name: 'Batteries laptop', description: 'Batteries pour ordinateurs portables' },
    { name: 'Chargeurs laptop', description: 'Chargeurs pour ordinateurs portables' },
    { name: 'RAM', description: 'Barrettes de mémoire RAM' },
    { name: 'Disques durs', description: 'HDD et SSD' },
    { name: 'Clé USB', description: 'Clés USB et stockage externe' },

    // Casque
    { name: 'Casque', description: 'Casques audio' },
    { name: 'Casque Bluetooth', description: 'Casques sans fil' },
    { name: 'Casque Gaming', description: 'Casques pour jeux vidéo' },
    { name: 'Écouteurs', description: 'Écouteurs intra-auriculaires' },

    // Appareil Photo
    { name: 'Appareil Photo', description: 'Appareils photo et caméras' },
    { name: 'Appareils photo numériques', description: 'Appareils photo numériques compacts et reflex' },
    { name: 'Objectifs', description: 'Objectifs pour appareils photo' },
    { name: 'Accessoires photo', description: 'Trépieds, sacs, cartes mémoire' },

    // Gaming
    { name: 'Gaming', description: 'Univers du jeu vidéo' },
    { name: 'Consoles', description: 'Consoles de jeux' },
    { name: 'Manettes', description: 'Manettes et contrôleurs' },
    { name: 'Accessoires gaming', description: 'Accessoires pour gamers' },

    // Speaker
    { name: 'Speaker', description: 'Enceintes et haut-parleurs' },
    { name: 'Enceintes Bluetooth', description: 'Enceintes portables sans fil' },
    { name: 'Soundbars', description: 'Barres de son pour TV' },

    // Accessoires
    { name: 'Accessoires', description: 'Accessoires divers' },
    { name: 'Lumière LED pour chambre', description: 'Éclairage décoratif LED' },
    { name: 'Lunettes', description: 'Lunettes de protection et style' },
    { name: 'Gadgets', description: 'Gadgets électroniques divers' },
    { name: 'Adaptateurs multiples', description: 'Hubs USB et adaptateurs' },
    { name: 'Montres', description: 'Montres connectées et classiques' }
];

async function seedCategories() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Optionnel : Vider la table avant (décommenter si souhaité)
        // await sequelize.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
        // console.log('Categories table truncated.');

        for (const cat of categories) {
            // Vérifier si la catégorie existe déjà
            const [results] = await sequelize.query('SELECT id FROM categories WHERE name = :name', {
                replacements: { name: cat.name },
                type: sequelize.QueryTypes.SELECT
            });

            if (results) {
                console.log(`Category "${cat.name}" already exists.`);
            } else {
                await sequelize.query('INSERT INTO categories (name, description, created_at, updated_at) VALUES (:name, :description, NOW(), NOW())', {
                    replacements: { name: cat.name, description: cat.description }
                });
                console.log(`Category "${cat.name}" inserted.`);
            }
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await sequelize.close();
    }
}

seedCategories();
