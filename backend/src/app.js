const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { notFound, errorHandler } = require('./middleware/error');
const logger = require('./config/logger');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

const parseBoolean = (value) =>
  ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
const trustProxyValue = process.env.TRUST_PROXY;
const trustProxy =
  trustProxyValue === undefined ? false : parseBoolean(trustProxyValue) ? 1 : 0;

app.set('trust proxy', trustProxy);
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(
  pinoHttp({
    logger,
    redact: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.newPassword',
      'req.body.refreshToken',
      'req.body.token'
    ],
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip
      }),
      res: (res) => ({
        statusCode: res.statusCode
      }),
      err: (err) => ({
        type: err.type,
        message: err.message
      })
    },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) => {
      const status = res.statusCode;
      const tag =
        status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
      return res.locals?.errorMessage
        ? `${tag} request failed: ${res.locals.errorMessage}`
        : `${tag} request completed`;
    },
    customErrorMessage: () => 'ERROR request errored'
  })
);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowAllOrigins = allowedOrigins.length === 0;
if (allowAllOrigins && process.env.NODE_ENV === 'production') {
  logger.warn('WARN CORS_ORIGIN not set; allowing all origins');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowAllOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
