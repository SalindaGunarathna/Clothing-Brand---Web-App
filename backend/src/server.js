require('dotenv').config();
const validateEnv = require('./config/env');

validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const seedInitialData = require('./seed/seedInitialData');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'INFO Server started');
    });
  } catch (err) {
    logger.error({ err }, 'ERROR Failed to start server');
    process.exit(1);
  }
};

startServer();
