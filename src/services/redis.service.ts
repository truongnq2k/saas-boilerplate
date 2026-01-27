import Redis from 'ioredis';

// Redis client singleton
let redisClient: Redis | null = null;

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected Successfully');
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis Ready');
    });
  }

  return redisClient;
}

/**
 * Cache ELIM API token with TTL
 */
export async function cacheElimToken(token: string, expiresIn: number): Promise<void> {
  try {
    const redis = getRedisClient();

    // Cache token with expiration time
    await redis.setex('elim_api_token', Math.floor(expiresIn / 1000), token);

    console.log(`🔑 ELIM Token cached for ${Math.floor(expiresIn / 1000)}s`);
  } catch (error) {
    console.error('Failed to cache ELIM token:', error);
    // Don't throw error to avoid breaking API calls
  }
}

/**
 * Get cached ELIM API token
 */
export async function getCachedElimToken(): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const token = await redis.get('elim_api_token');

    if (token) {
      console.log('🔑 Using cached ELIM token');
    }

    return token;
  } catch (error) {
    console.error('Failed to get cached ELIM token:', error);
    return null;
  }
}

/**
 * Clear cached ELIM API token
 */
export async function clearCachedElimToken(): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del('elim_api_token');
    console.log('🗑️ ELIM token cache cleared');
  } catch (error) {
    console.error('Failed to clear ELIM token cache:', error);
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌 Redis connection closed');
  }
}