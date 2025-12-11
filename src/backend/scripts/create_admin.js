
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';

const createAdmin = async () => {
    try {
        const email = 'admin@gadgetzone.com';
        const password = 'Admin123!';
        const name = 'Admin System';

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            console.log('Admin user already exists.');

            // Update role/password if needed just to be sure
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await existingUser.update({
                role: 'admin',
                password: hashedPassword,
                name: name
            });
            console.log('Admin user updated (password reset).');

        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully.');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

createAdmin();
