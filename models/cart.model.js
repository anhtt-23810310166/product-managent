const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    // ID dùng để lưu vào cookie nhận diện khách vãng lai
    cartId: {
        type: String,
        required: true,
        unique: true
    },

    // ID user (để dành cho tính năng đăng nhập sau này)
    userId: {
        type: String,
        default: ""
    },

    // Danh sách sản phẩm trong giỏ
    items: [
        {
            productId: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            }
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
