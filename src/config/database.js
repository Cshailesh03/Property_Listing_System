const mongoose = require('mongoose');
const redis = require('redis');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

let redisClient;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'rediss://default:AUmjAAIjcDE3MTJkMmEzZGJkYzM0Y2EzYjJlYzFjZTQ3Zjc0MjQzZHAxMA@robust-foxhound-18851.upstash.io:6379',
      
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis connected successfully'));

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectDB, connectRedis, getRedisClient };
