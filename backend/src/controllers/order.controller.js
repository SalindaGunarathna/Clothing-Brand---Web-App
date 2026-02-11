const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/error');
const withTransaction = require('../utils/transaction');
const {
  sendOrderConfirmation,
  sendOrderStatusUpdate
} = require('../services/mailer.service');
const { sendOrderStatusWebhook } = require('../services/webhook.service');
const logger = require('../config/logger');

const withSession = (query, session) => (session ? query.session(session) : query);

// Safely read stock for a given size regardless of Map/plain object storage.
const getAvailableStock = (product, size) => {
  if (!product?.stockBySize) return undefined;
  if (typeof product.stockBySize.get === 'function') {
    return product.stockBySize.get(size);
  }
  return product.stockBySize[size];
};

// Create an order from the user's cart and update stock in a single transaction.
const checkout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const itemIds = Array.isArray(req.body?.itemIds) ? req.body.itemIds : null;

  const result = await withTransaction(async (session) => {
    // Transaction keeps stock updates, order creation, and cart updates consistent.
    const cart = await withSession(Cart.findOne({ user: userId }), session);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    let selectedItems = cart.items;
    if (itemIds && itemIds.length > 0) {
      // Allow partial checkout by selecting specific cart item ids.
      const itemIdSet = new Set(itemIds.map((id) => String(id)));
      selectedItems = cart.items.filter((item) =>
        itemIdSet.has(String(item._id))
      );

      if (selectedItems.length === 0) {
        throw new ApiError(400, 'No matching cart items selected');
      }
    }

    const productIds = [
      ...new Set(selectedItems.map((item) => item.product.toString()))
    ];
    const products = await withSession(
      Product.find({ _id: { $in: productIds }, isActive: true }),
      session
    );
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    let total = 0;
    const orderItems = [];
    const updatedProducts = new Set(); // avoid saving the same product multiple times

    for (const item of selectedItems) {
      const product = productMap.get(item.product.toString());
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (!product.sizes.includes(item.size)) {
        throw new ApiError(400, 'Selected size is not available');
      }

      const available = getAvailableStock(product, item.size);
      if (available !== undefined && item.quantity > available) {
        throw new ApiError(400, 'Insufficient stock');
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      });

      total += product.price * item.quantity;

      // Only decrement stock when per-size stock is tracked.
      if (available !== undefined) {
        const newQty = available - item.quantity;
        product.stockBySize.set(item.size, newQty);
        updatedProducts.add(product);
      }
    }

    for (const product of updatedProducts) {
      if (session) {
        await product.save({ session });
      } else {
        await product.save();
      }
    }

    const orderDoc = {
      user: userId,
      items: orderItems,
      total: Number(total.toFixed(2)),
      orderDate: new Date()
    };

    const [order] = await Order.create([orderDoc], { session });

    // Remove only the purchased items from the cart.
    if (selectedItems.length === cart.items.length) {
      cart.items = [];
    } else {
      const selectedIdSet = new Set(selectedItems.map((item) => String(item._id)));
      cart.items = cart.items.filter(
        (item) => !selectedIdSet.has(String(item._id))
      );
    }
    if (session) {
      await cart.save({ session });
    } else {
      await cart.save();
    }

    return { order };
  });

  logger.info(
    {
      orderId: result.order._id,
      userId: req.user.id,
      itemCount: result.order.items.length,
      total: result.order.total
    },
    'INFO Order placed'
  );

  try {
    await sendOrderConfirmation({
      to: req.user.email,
      order: result.order,
      userName: req.user.name
    });
  } catch (err) {
    logger.warn({ err }, 'WARN Order email failed');
  }

  res.status(201).json({ data: result.order });
});

// List orders for the authenticated user.
const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-orderDate').lean();

  logger.debug(
    { userId: req.user.id, count: orders.length },
    'DEBUG User orders listed'
  );

  res.json({ data: orders });
});

// Admin: list all orders with filters and pagination.
const listAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = req.query;

  const filter = {};
  if (status) {
    filter.status = String(status).toUpperCase();
  }
  if (startDate || endDate) {
    filter.orderDate = {};
    if (startDate) filter.orderDate.$gte = new Date(startDate);
    if (endDate) filter.orderDate.$lte = new Date(endDate);
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email role')
      .sort('-orderDate')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter)
  ]);

  logger.debug(
    {
      adminId: req.user.id,
      status: filter.status,
      page: pageNum,
      limit: limitNum,
      total,
      returned: orders.length
    },
    'DEBUG All orders listed'
  );

  res.json({
    data: orders,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Get a single order owned by the authenticated user.
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  }).lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  logger.debug(
    { userId: req.user.id, orderId: order._id },
    'DEBUG Order fetched'
  );

  res.json({ data: order });
});

// Admin: update order status and trigger notifications.
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const previousStatus = order.status;
  order.status = status.trim().toUpperCase();
  await order.save();

  logger.info(
    {
      adminId: req.user.id,
      orderId: order._id,
      previousStatus,
      status: order.status
    },
    'INFO Order status updated'
  );

  if (previousStatus !== order.status) {
    // Only notify external systems when the status actually changes.
    if (order.user?.email) {
      try {
        await sendOrderStatusUpdate({
          to: order.user.email,
          order,
          userName: order.user?.name,
          previousStatus
        });
      } catch (err) {
        logger.warn({ err }, 'WARN Order status email failed');
      }
    }

    await sendOrderStatusWebhook({ order, previousStatus });
  }

  res.json({ data: order, previousStatus });
});

module.exports = {
  checkout,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus
};
