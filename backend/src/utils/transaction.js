const mongoose = require('mongoose');
const logger = require('../config/logger');

const shouldBypassTransactions = (err) => {
  const message = err?.message || '';
  return (
    message.includes('Transaction numbers are only allowed on a replica set') ||
    message.includes('not supported by the connected mongod') ||
    message.includes('replica set')
  );
};

const withTransaction = async (fn) => {
  if (process.env.MONGO_USE_TRANSACTIONS === 'false') {
    return fn(null);
  }

  // Transactions require a replica set; fallback gracefully if unsupported.
  const session = await mongoose.connection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    if (shouldBypassTransactions(err)) {
      logger.warn('WARN Transactions not supported; running without transaction');
      return fn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = withTransaction;
