import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { isRedisAvailable } from './redis.js';

dotenv.config();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ to handle its own retries
    enableOfflineQueue: false
};

// Mock Queue implementation
class MockQueue {
    constructor(name) {
        this.name = name;
        console.warn(`📢 Using Mock Queue for [${name}] (Redis unavailable)`);
    }
    async add(name, data, opts) {
        console.log(`⏭️ [Mock Queue: ${this.name}] Skipping job "${name}" - Redis unavailable`);
        return { id: 'mock-id' };
    }
    on(event, callback) {
        // Silently ignore event handlers on mock queues
        return this;
    }
}

// Define Queues with fallback
export const emailQueue = isRedisAvailable
    ? new Queue('email-queue', { connection })
    : new MockQueue('email-queue');

export const notificationQueue = isRedisAvailable
    ? new Queue('notification-queue', { connection })
    : new MockQueue('notification-queue');

export const reconciliationQueue = isRedisAvailable
    ? new Queue('reconciliation-queue', { connection })
    : new MockQueue('reconciliation-queue');

// Error handlers for queues (only if actual queues exist)
if (isRedisAvailable) {
    emailQueue.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.warn('⚠️ Email Queue: Redis unavailable');
        } else {
            console.error('❌ Email Queue Error:', err.message);
        }
    });

    notificationQueue.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.warn('⚠️ Notification Queue: Redis unavailable');
        } else {
            console.error('❌ Notification Queue Error:', err.message);
        }
    });

    reconciliationQueue.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.warn('⚠️ Reconciliation Queue: Redis unavailable');
        } else {
            console.error('❌ Reconciliation Queue Error:', err.message);
        }
    });
}

console.log('📦 BullMQ Queues initialized');

/**
 * Helper to add a job to a queue
 */
export const addJob = async (queue, name, data, opts = {}) => {
    try {
        const job = await queue.add(name, data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            ...opts
        });
        if (job.id !== 'mock-id') {
            console.log(`✅ Job ${job.id} added to ${queue.name}`);
        }
        return job;
    } catch (error) {
        console.error(`❌ Failed to add job to ${queue.name}:`, error.message);
        return null;
    }
};

// Start repeatable reconciliation job (Every hour) - ONLY if redis is available
if (isRedisAvailable) {
    addJob(reconciliationQueue, 'reconcile-payments', {}, {
        repeat: { cron: '0 * * * *' } // Every hour
    }).catch(err => console.error('Failed to start reconciliation cron:', err));
}
