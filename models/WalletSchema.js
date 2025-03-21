// models/Wallet.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  orderId: {
    type: String,
    default: null,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});

const walletSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  transactions: [transactionSchema],
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;