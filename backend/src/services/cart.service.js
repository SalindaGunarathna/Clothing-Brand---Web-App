const Cart = require('../models/Cart');
const Product = require('../models/Product');
const withTransaction = require('../utils/transaction');

const withSession = (query, session) => (session ? query.session(session) : query);

const getAvailableStock = (product, size) => {
  if (!product?.stockBySize) return undefined;
  if (typeof product.stockBySize.get === 'function') {
    return product.stockBySize.get(size);
  }
  return product.stockBySize[size];
};

const mergeGuestCartIntoUser = async ({ userId, guestId }) => {
  if (!userId || !guestId) return;

  await withTransaction(async (session) => {
    const guestCart = await withSession(Cart.findOne({ guestId }), session);
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await withSession(Cart.findOne({ user: userId }), session);

    const productIds = [
      ...new Set(guestCart.items.map((item) => item.product.toString()))
    ];
    const products = await withSession(
      Product.find({ _id: { $in: productIds }, isActive: true }),
      session
    );
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const mergedItems = [];

    for (const item of guestCart.items) {
      const product = productMap.get(item.product.toString());
      if (!product) continue;
      if (!product.sizes.includes(item.size)) continue;

      let qty = Math.min(item.quantity, 99);
      const available = getAvailableStock(product, item.size);
      if (available !== undefined) {
        qty = Math.min(qty, available);
      }
      if (qty < 1) continue;

      const existing = mergedItems.find(
        (merged) =>
          merged.product.toString() === item.product.toString() &&
          merged.size === item.size
      );

      if (existing) {
        let combined = existing.quantity + qty;
        if (available !== undefined) {
          combined = Math.min(combined, available);
        }
        existing.quantity = Math.min(combined, 99);
      } else {
        mergedItems.push({
          product: item.product,
          size: item.size,
          quantity: qty
        });
      }
    }

    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    for (const item of mergedItems) {
      const existing = userCart.items.find(
        (cartItem) =>
          cartItem.product.toString() === item.product.toString() &&
          cartItem.size === item.size
      );

      if (existing) {
        let combined = existing.quantity + item.quantity;
        const product = productMap.get(item.product.toString());
        const available = getAvailableStock(product, item.size);
        if (available !== undefined) {
          combined = Math.min(combined, available);
        }
        existing.quantity = Math.min(combined, 99);
      } else {
        userCart.items.push(item);
      }
    }

    if (session) {
      await userCart.save({ session });
      await guestCart.deleteOne({ session });
    } else {
      await userCart.save();
      await guestCart.deleteOne();
    }
  });
};

module.exports = { mergeGuestCartIntoUser };
