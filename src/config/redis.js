import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('[REDIS ERROR]:', err);
});

redis.on('connect', () => {
  console.log('[REDIS]: Connected successfully');
});

/**
 * Utility to get cached data or fetch and cache it if not present.
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default 1 hour)
 */
export const getOrCache = async (key, fetchFn, ttl = 3600) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const data = await fetchFn();
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
    return data;
  } catch (error) {
    console.error(`[REDIS CACHE ERROR] Key: ${key}:`, error);
    return fetchFn(); // Fallback to fetching directly if Redis fails
  }
};

export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`[REDIS INVALIDATION ERROR] Pattern: ${pattern}:`, error);
  }
};

export default redis;
