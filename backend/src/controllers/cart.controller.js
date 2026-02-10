const crypto = require('crypto');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/error');
const { getGuestId } = require('../utils/guest');

const getCartFilter = (req) => {
  if (req.user?.id) {
    return { user: req.user.id };
  }
  const guestId = getGuestId(req);
  return guestId ? { guestId } : null;
};

const getAvailableStock = (product, size) => {
  if (!product?.stockBySize) return undefined;
  if (typeof product.stockBySize.get === 'function') {
    return product.stockBySize.get(size);
  }
  return product.stockBySize[size];
};

const buildCartResponse = async (cart, guestId) => {
  if (!cart) {
    return { data: { items: [], total: 0 }, guestId };
  }

  const populated = await cart.populate('items.product');
  const items = populated.items
    .filter((item) => item.product && item.product.isActive)
    .map((item) => ({
      id: item._id,
      product: {
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        category: item.product.category
      },
      size: item.size,
      quantity: item.quantity
    }));

  const total = Number(
    items
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      .toFixed(2)
  );

  return { data: { items, total }, guestId };
};

const getCart = asyncHandler(async (req, res) => {
  const filter = getCartFilter(req);
  const cart = filter ? await Cart.findOne(filter) : null;
  const guestId = filter?.guestId || undefined;
  res.json(await buildCartResponse(cart, guestId));
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const quantity = req.body.quantity ? Number(req.body.quantity) : 1;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const normalizedSize = String(size).toUpperCase();
  if (!product.sizes.includes(normalizedSize)) {
    throw new ApiError(400, 'Selected size is not available');
  }

  const availableStock = getAvailableStock(product, normalizedSize);
  if (availableStock !== undefined && availableStock < 1) {
    throw new ApiError(400, 'Insufficient stock');
  }

  let filter = getCartFilter(req);
  let guestId = filter?.guestId;

  if (!filter) {
    guestId = crypto.randomUUID();
    filter = { guestId };
  }

  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({ ...filter, items: [] });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId && item.size === normalizedSize
  );

  if (existingItem) {
    let desiredQty = existingItem.quantity + quantity;
    if (availableStock !== undefined && desiredQty > availableStock) {
      throw new ApiError(400, 'Insufficient stock');
    }
    existingItem.quantity = Math.min(desiredQty, 99);
  } else {
    if (availableStock !== undefined && quantity > availableStock) {
      throw new ApiError(400, 'Insufficient stock');
    }
    cart.items.push({
      product: productId,
      size: normalizedSize,
      quantity: Math.min(quantity, 99)
    });
  }

  await cart.save();

  res.status(201).json(await buildCartResponse(cart, guestId));
});

const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const filter = getCartFilter(req);
  if (!filter) {
    throw new ApiError(400, 'Guest id required');
  }

  const cart = await Cart.findOne(filter);
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  const product = await Product.findOne({
    _id: item.product,
    isActive: true
  });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.sizes.includes(item.size)) {
    throw new ApiError(400, 'Selected size is not available');
  }

  const availableStock = getAvailableStock(product, item.size);
  const desiredQty = Math.min(Number(quantity), 99);
  if (availableStock !== undefined && desiredQty > availableStock) {
    throw new ApiError(400, 'Insufficient stock');
  }

  item.quantity = desiredQty;
  await cart.save();

  res.json(await buildCartResponse(cart, filter.guestId));
});

const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const filter = getCartFilter(req);
  if (!filter) {
    throw new ApiError(400, 'Guest id required');
  }

  const cart = await Cart.findOne(filter);
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  cart.items.pull(itemId);
  await cart.save();

  res.json(await buildCartResponse(cart, filter.guestId));
});

const clearCart = asyncHandler(async (req, res) => {
  const filter = getCartFilter(req);
  if (!filter) {
    throw new ApiError(400, 'Guest id required');
  }

  const cart = await Cart.findOne(filter);
  if (!cart) {
    return res.json({ data: { items: [] }, guestId: filter.guestId });
  }

  cart.items = [];
  await cart.save();

  res.json(await buildCartResponse(cart, filter.guestId));
});

const getCartTotal = asyncHandler(async (req, res) => {
  const filter = getCartFilter(req);
  const cart = filter ? await Cart.findOne(filter) : null;
  const response = await buildCartResponse(cart, filter?.guestId);
  const itemCount = response.data.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  res.json({ total: response.data.total, itemCount, guestId: response.guestId });
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartTotal
};
