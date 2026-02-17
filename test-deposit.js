import { Deposit } from './src/backend/models/index.js';
import sequelize from './src/backend/config/database.js';

async function testDeposit() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Testing Deposit query...');
        const deposits = await Deposit.findAll({
            limit: 10
        });
        console.log('Deposits found:', deposits.length);
        console.log(JSON.stringify(deposits, null, 2));

        console.log('Testing Count...');
        const count = await Deposit.count();
        console.log('Count:', count);

    } catch (error) {
        console.error('Error fetching deposits:', error);
    } finally {
        await sequelize.close();
    }
}

testDeposit();
