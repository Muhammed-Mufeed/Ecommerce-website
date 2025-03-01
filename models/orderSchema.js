const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const addressSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: false,
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work'],
    default: 'Home',
  },
});

const orderSchema = new Schema({
  orderId: {
    type: String,
    unique: true,
    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  address: addressSchema,
  finalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cod'], 
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

// Generate a unique order ID before saving
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const timestamp = Date.now(); // Current timestamp
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    this.orderId = `ORD${timestamp}${random}`; // Combine timestamp and random number
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;