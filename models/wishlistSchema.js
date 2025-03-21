const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ensures one wishlist per user
    },
    items: [wishlistItemSchema]
}, { timestamps: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;