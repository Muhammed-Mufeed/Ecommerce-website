const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

  couponCode: {
    type: String,
    required: true,
    unique: true,
  },

  discountAmount: {
    type: Number,
    required: true,
  },

  minPurchaseAmount: {
    type: Number,
    required: true,
  },

  validFrom: {
    type: Date,
    required: true,
  },
  
  validTo: {
    type: Date,
    required: true,
  },

  usageLimit: {
    type: Number, 
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true, 
  },

  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
    },
  ],
  
},{timestamps:true});



const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;