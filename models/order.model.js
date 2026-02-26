const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // User đặt hàng (nếu đã đăng nhập)
    userId: {
        type: String,
        default: ""
    },

    // Thông tin khách hàng
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    customerAddress: {
        type: String,
        required: true
    },
    customerNote: {
        type: String,
        default: ""
    },

    // Danh sách sản phẩm (snapshot tại thời điểm đặt)
    items: [
        {
            productId: String,
            title: String,
            thumbnail: String,
            price: Number,
            discountPercentage: Number,
            unitPrice: Number,
            quantity: Number,
            itemTotal: Number
        }
    ],

    // Tổng tiền
    totalAmount: {
        type: Number,
        default: 0
    },

    // Trạng thái đơn hàng
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"]
    },

    // Thanh toán
    paymentMethod: {
        type: String,
        default: "cod",
        enum: ["cod", "vnpay"]
    },
    paymentStatus: {
        type: String,
        default: "unpaid",
        enum: ["unpaid", "paid"]
    },
    vnpayTransactionNo: {
        type: String,
        default: ""
    },

    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
