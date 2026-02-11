const User = require('../models/User');
const Product = require('../models/Product');
const { USER_ROLES } = require('../config/constants');
const products = require('../data/products');
const logger = require('../config/logger');

const normalizeEmail = (value) => value.trim().toLowerCase();

const seedUsersIfMissing = async () => {
  const adminEmail = normalizeEmail(
    process.env.SEED_ADMIN_EMAIL || 'admin@clothingbrand.local'
  );
  const userEmail = normalizeEmail(
    process.env.SEED_USER_EMAIL || 'user@clothingbrand.local'
  );

  const existing = await User.find({
    email: { $in: [adminEmail, userEmail] }
  }).select('email');

  const existingSet = new Set(existing.map((user) => user.email));
  const toCreate = [];

  if (!existingSet.has(adminEmail)) {
    toCreate.push({
      name: process.env.SEED_ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
      role: USER_ROLES.ADMIN
    });
  }

  if (!existingSet.has(userEmail)) {
    toCreate.push({
      name: process.env.SEED_USER_NAME || 'Demo User',
      email: userEmail,
      password: process.env.SEED_USER_PASSWORD || 'User123!',
      role: USER_ROLES.USER
    });
  }

  if (toCreate.length === 0) {
    logger.info('INFO Seed users already exist; skipping');
    return;
  }

  for (const userData of toCreate) {
    const user = new User(userData);
    await user.save();
  }
  logger.info({ count: toCreate.length }, 'INFO Seed users created');
};

const seedProductsIfEmpty = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    logger.info({ count }, 'INFO Products already exist; skipping seed');
    return;
  }

  await Product.insertMany(products);
  logger.info({ count: products.length }, 'INFO Products seeded');
};

const seedInitialData = async () => {
  if (process.env.SEED_ON_START === 'false') {
    logger.info('INFO Seed on start disabled');
    return;
  }

  await seedUsersIfMissing();
  await seedProductsIfEmpty();
};

module.exports = seedInitialData;
