const mongoose = require('mongoose');
const { PRODUCT_SIZES } = require('../config/constants');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    size: {
      type: String,
      required: true,
      enum: Object.values(PRODUCT_SIZES)
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true
    },
    guestId: {
      type: String,
      unique: true,
      sparse: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
