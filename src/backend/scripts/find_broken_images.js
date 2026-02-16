
import { Product } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const findBrokenImages = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Look for images that don't start with http or https, or data:
        // And specifically look for the ones mentioned by the user
        const brokenProducts = await Product.findAll({
            where: {
                [Op.and]: [
                    { image_url: { [Op.notLike]: 'http%' } },
                    { image_url: { [Op.notLike]: 'data:%' } }
                ]
            },
            attributes: ['id', 'name', 'image_url']
        });

        console.log('--- Potentially Broken Images ---');
        brokenProducts.forEach(p => {
            // Filter out base64 or valid URLs if the SQL didn't catch them strictly (though Op.notLike should work)
            // The goal is to catch '71p0vD7N4BL._AC_SL1500_.jpg' type strings
            if (!p.image_url.startsWith('http') && !p.image_url.startsWith('data:')) {
                console.log(`ID: ${p.id} | Name: ${p.name} | Image: ${p.image_url}`);
            }
        });
        console.log('---------------------------------');

    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await sequelize.close();
    }
};

findBrokenImages();
