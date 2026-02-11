const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    jti: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date
    },
    replacedByTokenHash: {
      type: String
    },
    createdByIp: {
      type: String
    },
    revokedByIp: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
