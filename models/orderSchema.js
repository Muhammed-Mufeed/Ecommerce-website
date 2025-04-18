const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  _id: {
     type: Schema.Types.ObjectId,
      auto: true 
    }, 

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

  product: {
    name: {
      type: String,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    soldPrice: {
      type: Number,
      required: true,
    }
  
  },
  variant: {
    color: {
      type: String,
      required: true,
    },
    colorName: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
      required: true,
    }],
  },

  quantity: {
    type: Number,
    required: true,
  },


  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled',, 'Returned'],
    default: 'Pending',
  },

  cancellationReason: {
    type:String,
    default:null
  },
  return: {
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected'],
      default: null,
    },
    reason: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
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

  deliveryCharge: { 
    type: Number,
    required: true,
    default: 0, 
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'online','wallet'], 
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },

  paymentDetails: {
    
    razorpayOrderId: {
      type: String,
      default: null,
    },
  
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  
    razorpaySignature: {
      type: String,
      default: null,
    },
  },

  coupon: {

    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },

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