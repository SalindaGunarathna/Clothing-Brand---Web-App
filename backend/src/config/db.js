const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  mongoose.set('strictQuery', true);

  const autoIndex =
    process.env.MONGO_AUTO_INDEX !== undefined
      ? String(process.env.MONGO_AUTO_INDEX).toLowerCase() === 'true'
      : process.env.NODE_ENV !== 'production';

  await mongoose.connect(uri, {
    autoIndex
  });

  logger.info('INFO MongoDB connected');
};

module.exports = connectDB;
