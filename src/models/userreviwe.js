const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    username: String,
    comment: String,
    rating: Number,
    timestamp: { type: Date, default: Date.now }
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;