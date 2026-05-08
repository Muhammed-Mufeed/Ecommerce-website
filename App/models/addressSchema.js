const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',             // Reference to the User model
        required: true,
    },
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
        required: false, // Optional field
    },
    addressType: {
        type: String,
        enum: ['Home', 'Work'], 
        default: 'Home'
    },
    isListed:{
        type:Boolean,
        default:true 
    }
}, { timestamps: true }); 

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;