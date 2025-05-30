const cacheService = require('../services/cacheService');

const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Check cache
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = async (data) => {
        // Cache the response
        await cacheService.set(cacheKey, data, ttl);
        // Send the response
        originalJson(data);
      };

      next();
    } catch (error) {
      // Continue without caching on error
      next();
    }
  };
};

module.exports = cacheMiddleware;
