const mongoose = require('mongoose');
const {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES
} = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(PRODUCT_CATEGORIES)
    },
    sizes: {
      type: [String],
      required: true,
      enum: Object.values(PRODUCT_SIZES)
    },
    stockBySize: {
      type: Map,
      of: Number,
      default: undefined,
      validate: {
        validator: function (value) {
          if (!value) return true;
          for (const [size, qty] of value.entries()) {
            if (!Object.values(PRODUCT_SIZES).includes(size)) return false;
            if (Array.isArray(this.sizes) && !this.sizes.includes(size)) {
              return false;
            }
            if (!Number.isInteger(qty) || qty < 0) return false;
          }
          return true;
        },
        message: 'Invalid stockBySize values'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
