import { Worker, Queue } from 'bullmq';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { workerLogger } from '../utils/logger.js';
import monCashService from '../services/moncash.service.js';
import { Order, Boost, Product } from '../models/index.js';
import PaymentService from '../services/PaymentService.js';
import { isRedisAvailable } from '../config/redis.js';

dotenv.config();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false
};

const paymentService = new PaymentService();

const reconciliationWorker = isRedisAvailable ? new Worker('reconciliation-queue', async (job) => {
    workerLogger.info(`🔄 Starting Payment Reconciliation Job ${job.id}`);

    try {
        // 1. Find all pending orders older than 15 minutes (to avoid race conditions with webhooks)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const pendingOrders = await Order.findAll({
            where: {
                status: 'pending',
                created_at: { $lt: fifteenMinutesAgo }
            }
        });

        workerLogger.info(`📦 Found ${pendingOrders.length} pending orders to reconcile.`);

        for (const order of pendingOrders) {
            try {
                workerLogger.info(`🔍 Checking MonCash status for order: ${order.order_number}`);
                const success = await paymentService.verifyPaymentStatic(order.id);
                if (success) {
                    workerLogger.info(`✅ Payment confirmed for order ${order.id}.`);
                }
            } catch (err) {
                workerLogger.error(`❌ Error reconciling order ${order.id}`, err);
            }
        }

        // 2. Reconcile Pending Boosts
        const pendingBoosts = await Boost.findAll({
            where: {
                status: 'pending',
                created_at: { [Op.lt]: fifteenMinutesAgo }
            }
        });

        workerLogger.info(`🚀 Found ${pendingBoosts.length} pending boosts to reconcile.`);

        for (const boost of pendingBoosts) {
            try {
                workerLogger.info(`🔍 Checking MonCash status for boost: ${boost.id}`);
                const success = await paymentService.verifyPaymentStatic(`BOOST_${boost.id}`);
                if (success) {
                    workerLogger.info(`✅ Payment confirmed for boost ${boost.id}. Activated.`);
                }
            } catch (err) {
                workerLogger.error(`❌ Error reconciling boost ${boost.id}`, err);
            }
        }

        // 3. AUTO-EXPIRATION: Find active boosts that should be expired
        const now = new Date();
        const expiredBoosts = await Boost.findAll({
            where: {
                status: 'active',
                endsAt: { [Op.lt]: now }
            }
        });

        workerLogger.info(`⌛ Found ${expiredBoosts.length} active boosts to expire.`);

        for (const boost of expiredBoosts) {
            try {
                workerLogger.info(`📉 Expiring boost ${boost.id} for product ${boost.productId}`);

                // Update boost status
                await boost.update({
                    status: 'expired',
                    updated_at: now
                });

                // Remove sponsored flag from product
                await Product.update(
                    { is_sponsored: false },
                    { where: { id: boost.productId } }
                );

                workerLogger.info(`✅ Boost ${boost.id} expired successfully.`);
            } catch (err) {
                workerLogger.error(`❌ Error expiring boost ${boost.id}`, err);
            }
        }

        workerLogger.info('🏁 Reconciliation job finished.');
    } catch (error) {
        workerLogger.error('💀 Global reconciliation error', error);
        throw error;
    }
}, { connection }) : null;

if (reconciliationWorker) {
    reconciliationWorker.on('failed', (job, err) => {
        workerLogger.error(`💀 Reconciliation job ${job.id} failed`, err);
    });
} else {
    console.log('🔇 Reconciliation Worker: Skipped initialization (Redis unavailable)');
}

export default reconciliationWorker;
