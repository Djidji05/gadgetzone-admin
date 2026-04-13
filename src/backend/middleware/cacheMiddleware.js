import { getCache, setCache } from '../config/redis.js';

/**
 * Enhanced Cache Middleware for Express
 * Supports Redis with In-Memory fallback.
 */

const memoryCache = new Map();

export const cacheMiddleware = (durationInMinutes = 5) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Exclude specific routes if needed (e.g., health check)
        if (req.url.includes('/health') || req.url.includes('/api/notifications')) {
            return next();
        }

        const key = req.originalUrl || req.url;

        try {
            // 1. Try Redis Cache first
            const redisData = await getCache(key);
            if (redisData) {
                // console.log(`[Cache] Serving ${key} from Redis`);
                return res.json(redisData);
            }

            // 2. Try In-Memory Cache as fallback
            const cachedResponse = memoryCache.get(key);
            if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
                // console.log(`[Cache] Serving ${key} from memory`);
                return res.json(cachedResponse.data);
            }
        } catch (error) {
            console.error('[Cache] Read error:', error.message);
        }

        // Prevent multiple overrides
        if (res._isCachedWrapped) {
            return next();
        }
        res._isCachedWrapped = true;

        // Override res.json to capture the data
        const originalJson = res.json;
        res.json = function (data) {
            try {
                // Only cache successful responses (200 OK)
                if (res.statusCode === 200 && data) {
                    const expiresAt = Date.now() + durationInMinutes * 60 * 1000;

                    // Save to In-Memory
                    memoryCache.set(key, {
                        data: data,
                        expiresAt: expiresAt
                    });

                    // Save to Redis (async)
                    setCache(key, data, durationInMinutes * 60).catch(err =>
                        console.error('[Cache] Redis save error:', err.message)
                    );
                }
            } catch (err) {
                console.error('[Cache] Strategy error:', err);
            }

            // Restore original before calling it
            res.json = originalJson;
            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Helper to clear cache for a specific pattern or all
 */
export const clearCache = (pattern = null) => {
    if (!pattern) {
        memoryCache.clear();
        // Redis clear if needed (requires flushdb or specific pattern)
        console.log('[Cache] Memory cleared');
    } else {
        const keys = Array.from(memoryCache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                memoryCache.delete(key);
            }
        });
        console.log(`[Cache] Memory pattern cleared: ${pattern}`);
    }
};

