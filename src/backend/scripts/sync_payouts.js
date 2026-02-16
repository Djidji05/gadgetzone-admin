import sequelize from '../config/database.js';
import { Payout } from '../models/index.js';

const syncPayouts = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to DB');

        console.log('🔄 Syncing Payouts table...');
        await Payout.sync({ alter: true });
        console.log('✅ Payouts table synced successfully');

    } catch (error) {
        console.error('❌ Error syncing payouts:', error);
    } finally {
        await sequelize.close();
    }
};

syncPayouts();
