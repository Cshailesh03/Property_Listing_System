const cacheService = require('../services/cacheService');

const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const originalJson = res.json.bind(res);

      res.json = async (data) => {
        await cacheService.set(cacheKey, data, ttl);
        originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cacheMiddleware;
