import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        // Retry connection up to 10 times, then wait 30s before trying again
        if (times > 10) {
            return 30000;
        }
        return Math.min(times * 100, 3000);
    },
    maxRetriesPerRequest: 3, // Don't hang requests if redis is down
    enableOfflineQueue: false, // Discard commands when redis is down
};

export let isRedisAvailable = false;
let firstConnectionAttempt = true;
let redisClient = null;

try {
    redisClient = new Redis(redisConfig);

    redisClient.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            if (firstConnectionAttempt) {
                console.warn('⚠️ Redis not available at', `${redisConfig.host}:${redisConfig.port}`, '- running without background queues');
                isRedisAvailable = false;
                firstConnectionAttempt = false;
            }
        } else {
            console.error('❌ Redis Error:', err.message);
        }
    });

    redisClient.on('connect', () => {
        if (firstConnectionAttempt) {
            console.log('✅ Connecting to Redis...');
        }
    });

    redisClient.on('ready', () => {
        console.log('✅ Redis is ready');
        isRedisAvailable = true;
        firstConnectionAttempt = false;
    });

    redisClient.on('close', () => {
        if (isRedisAvailable) {
            console.warn('⚠️ Redis connection closed');
            isRedisAvailable = false;
        }
    });
} catch (error) {
    console.error('❌ Could not initialize Redis client:', error.message);
    isRedisAvailable = false;
}

/**
 * Helper to check if redis is available
 */
const isRedisReady = () => redisClient && redisClient.status === 'ready';

/**
 * Helper to get a value from cache
 */
export const getCache = async (key) => {
    if (!isRedisReady()) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`❌ Redis Get Error [${key}]:`, error.message);
        return null;
    }
};

/**
 * Helper to set a value in cache
 */
export const setCache = async (key, value, ttl = 3600) => {
    if (!isRedisReady()) return;
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
        console.error(`❌ Redis Set Error [${key}]:`, error.message);
    }
};

/**
 * Helper to delete a key from cache
 */
export const delCache = async (key) => {
    if (!isRedisReady()) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`❌ Redis Del Error [${key}]:`, error.message);
    }
};

/**
 * Helper to delete keys by pattern (e.g., products:*)
 */
export const delCacheByPattern = async (pattern) => {
    if (!isRedisReady()) return;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    } catch (error) {
        console.error(`❌ Redis DelPattern Error [${pattern}]:`, error.message);
    }
};

export default redisClient;
