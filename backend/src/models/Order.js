const mongoose = require('mongoose');
const { PRODUCT_SIZES } = require('../config/constants');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
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
    },
    imageUrl: {
      type: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    shippingAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
      },
      address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },
      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      zip: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
      }
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
