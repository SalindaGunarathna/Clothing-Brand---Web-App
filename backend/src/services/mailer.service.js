const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporterPromise;
let usingTestAccount = false;

const createTransporter = async () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    usingTestAccount = true;
    logger.warn('WARN SMTP not configured; using Ethereal test account');
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return null;
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
};

const buildOrderEmail = (order, userName) => {
  const lines = order.items.map(
    (item) =>
      `- ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | $${item.price.toFixed(
        2
      )}`
  );

  const text = [
    `Hi ${userName || 'Customer'},`,
    '',
    'Thanks for your order! Here is your order summary:',
    '',
    ...lines,
    '',
    `Total: $${order.total.toFixed(2)}`,
    `Order ID: ${order._id}`,
    `Order Date: ${order.orderDate.toISOString()}`,
    '',
    'We appreciate your purchase.'
  ].join('\n');

  const html = `
    <p>Hi ${userName || 'Customer'},</p>
    <p>Thanks for your order! Here is your order summary:</p>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.name} | Size: ${item.size} | Qty: ${item.quantity} | $${item.price.toFixed(
              2
            )}</li>`
        )
        .join('')}
    </ul>
    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Order Date:</strong> ${order.orderDate.toISOString()}</p>
    <p>We appreciate your purchase.</p>
  `;

  return { subject: 'Order Confirmation', text, html };
};

const sendOrderConfirmation = async ({ to, order, userName }) => {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.warn('WARN SMTP not configured; skipping confirmation email');
    return;
  }

  const from = process.env.EMAIL_FROM || 'no-reply@clothingbrand.local';
  const { subject, text, html } = buildOrderEmail(order, userName);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  if (usingTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ previewUrl }, 'INFO Email preview URL');
    }
  }
};

const buildStatusUpdateEmail = (order, userName, previousStatus) => {
  const text = [
    `Hi ${userName || 'Customer'},`,
    '',
    `Your order status has been updated from ${previousStatus} to ${order.status}.`,
    `Order ID: ${order._id}`,
    `Order Date: ${order.orderDate.toISOString()}`,
    '',
    'Thank you for shopping with us.'
  ].join('\n');

  const html = `
    <p>Hi ${userName || 'Customer'},</p>
    <p>Your order status has been updated from <strong>${previousStatus}</strong> to <strong>${order.status}</strong>.</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Order Date:</strong> ${order.orderDate.toISOString()}</p>
    <p>Thank you for shopping with us.</p>
  `;

  return { subject: 'Order Status Update', text, html };
};

const sendOrderStatusUpdate = async ({
  to,
  order,
  userName,
  previousStatus
}) => {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.warn('WARN SMTP not configured; skipping status email');
    return;
  }

  const from = process.env.EMAIL_FROM || 'no-reply@clothingbrand.local';
  const { subject, text, html } = buildStatusUpdateEmail(
    order,
    userName,
    previousStatus
  );

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  if (usingTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ previewUrl }, 'INFO Email preview URL');
    }
  }
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };
