const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  otp:{
    type:String,
    required:true
  },
  userId:{
    type:String,
    unique:true,
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now       // Automatically set the current time when OTP is generated
  },
  expiresAt:{
    type:Date,
    required:true,
  }
});

// Add TTL index on expiresAt field to delete OTP after a set period
otpSchema.index({ expiresAt: 1}, {expireAfterSeconds:0})


module.exports = mongoose.model('Otp',otpSchema)
