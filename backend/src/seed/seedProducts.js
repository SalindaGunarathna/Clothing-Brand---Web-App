require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const products = require('../data/products');
const logger = require('../config/logger');

const seed = async () => {
  try {
    await connectDB();

    const existing = await Product.countDocuments();
    if (existing > 0 && process.env.SEED_FORCE !== 'true') {
      logger.info('INFO Products already exist; skipping seed');
      process.exit(0);
    }

    if (process.env.SEED_FORCE === 'true') {
      await Product.deleteMany({});
    }

    await Product.insertMany(products);
    logger.info({ count: products.length }, 'INFO Products seeded');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'ERROR Product seed failed');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
