const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: String,
    userAvatar: String,
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ""
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
