import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { workerLogger } from '../utils/logger.js';
import { isRedisAvailable } from '../config/redis.js';

dotenv.config();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableOfflineQueue: false
};

const emailWorker = isRedisAvailable ? new Worker('email-queue', async (job) => {
    workerLogger.info(`📧 Processing email job ${job.id}: ${job.name}`);
    const { to, subject, template, data } = job.data;

    try {
        // Here we would call the actual email service
        // For now, simulate sending
        workerLogger.info(`👉 Sending email to ${to} with subject: ${subject}`);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        workerLogger.info(`✅ Email sent to ${to}`);
    } catch (error) {
        workerLogger.error(`❌ Failed to send email ${job.id}`, error);
        throw error; // Let BullMQ handle retries
    }
}, { connection }) : null;

if (emailWorker) {
    emailWorker.on('completed', (job) => {
        workerLogger.info(`🎊 Email job ${job.id} completed successfully`);
    });

    emailWorker.on('failed', (job, err) => {
        workerLogger.error(`💀 Email job ${job.id} failed`, err);
    });
} else {
    console.log('🔇 Email Worker: Skipped initialization (Redis unavailable)');
}

export default emailWorker;
