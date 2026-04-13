import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { workerLogger } from '../utils/logger.js';
import { createNotification, notifyAllAdmins } from '../utils/notificationHelper.js';
import { isRedisAvailable } from '../config/redis.js';

dotenv.config();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableOfflineQueue: false
};

const notificationWorker = isRedisAvailable ? new Worker('notification-queue', async (job) => {
    workerLogger.info(`🔔 Processing notification job ${job.id}: ${job.name}`);
    const { type, userId, role, title, message, options } = job.data;

    try {
        if (job.name === 'admin-alert') {
            await notifyAllAdmins(type, title, message, options);
        } else if (job.name === 'user-notification' && userId) {
            await createNotification(userId, type, title, message, options);
        } else if (job.name === 'role-notification' && role) {
            // notifyByRole logic if needed
        }

        workerLogger.info(`✅ Notification processed: ${title}`);
    } catch (error) {
        workerLogger.error(`❌ Failed to process notification ${job.id}`, error);
        throw error;
    }
}, { connection }) : null;

if (!notificationWorker) {
    console.log('🔇 Notification Worker: Skipped initialization (Redis unavailable)');
} else {
    notificationWorker.on('completed', (job) => {
        workerLogger.info(`✨ Notification job ${job.id} completed`);
    });
}

export default notificationWorker;
