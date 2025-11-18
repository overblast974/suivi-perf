// Simple in-memory cache for Supabase data
// Reduces API calls and improves responsiveness

class DataCache {
    constructor() {
        this.cache = new Map();
        this.config = window.CONSTANTS?.CACHE_CONFIG || {
            TTL_WORKOUTS: 60000,   // 1 minute
            TTL_PROFILE: 300000,   // 5 minutes
            TTL_GOALS: 60000       // 1 minute
        };
    }

    /**
     * Generate a cache key from operation and parameters
     * @param {string} operation - Operation name (e.g., 'getAllWorkouts')
     * @param {Object} params - Optional parameters
     * @returns {string} - Cache key
     */
    generateKey(operation, params = {}) {
        const paramsStr = JSON.stringify(params);
        return `${operation}:${paramsStr}`;
    }

    /**
     * Set a value in the cache with automatic TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = this.config.TTL_WORKOUTS) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Get a value from the cache if not expired
     * @param {string} key - Cache key
     * @returns {*} - Cached value or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        const age = Date.now() - item.timestamp;

        if (age > item.ttl) {
            // Expired, remove from cache
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if a key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} - True if key exists and is valid
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Invalidate (remove) a specific key or pattern
     * @param {string} keyPattern - Key or pattern to invalidate
     */
    invalidate(keyPattern) {
        if (keyPattern.endsWith('*')) {
            // Pattern invalidation (e.g., 'workouts:*')
            const prefix = keyPattern.slice(0, -1);
            for (const key of this.cache.keys()) {
                if (key.startsWith(prefix)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Exact key invalidation
            this.cache.delete(keyPattern);
        }
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache stats
     */
    getStats() {
        const now = Date.now();
        let validCount = 0;
        let expiredCount = 0;

        for (const [key, item] of this.cache.entries()) {
            const age = now - item.timestamp;
            if (age > item.ttl) {
                expiredCount++;
            } else {
                validCount++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries: validCount,
            expiredEntries: expiredCount
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, item] of this.cache.entries()) {
            const age = now - item.timestamp;
            if (age > item.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));

        return keysToDelete.length;
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.DataCache = DataCache;
}
