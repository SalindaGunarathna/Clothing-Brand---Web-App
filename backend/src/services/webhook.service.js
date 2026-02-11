const logger = require('../config/logger');

const sendOrderStatusWebhook = async ({ order, previousStatus }) => {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  const controller = new AbortController();
  const timeoutMs = Number(process.env.WEBHOOK_TIMEOUT_MS || 5000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    event: 'order.status_updated',
    data: {
      id: order._id,
      userId: order.user?._id || order.user,
      status: order.status,
      previousStatus,
      orderDate: order.orderDate
    }
  };

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.WEBHOOK_SECRET) {
    headers['X-Webhook-Secret'] = process.env.WEBHOOK_SECRET;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`Webhook failed with status ${res.status}`);
    }
  } catch (err) {
    logger.warn({ err }, 'WARN Order status webhook failed');
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { sendOrderStatusWebhook };
