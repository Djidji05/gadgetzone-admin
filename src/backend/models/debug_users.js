
import { User, Store } from './index.js';
import { closeConnection } from '../config/database.js';

async function debugUsers() {
    try {
        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
        users.forEach(u => console.log(`${u.id}: ${u.name} (${u.email}) - ${u.role}`));

        const stores = await Store.findAll();
        stores.forEach(s => console.log(`Store: ${s.id} "${s.name}" -> Owner ${s.userId}`));

    } catch (error) {
        console.error(error);
    } finally {
        await closeConnection();
    }
}

debugUsers();
