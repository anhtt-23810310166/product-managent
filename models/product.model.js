const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const productSchema = new mongoose.Schema({
    title: String,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    position: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

productSchema.plugin(slug);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
