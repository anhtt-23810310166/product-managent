const Review = require("../../models/review.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

// [POST] /reviews/:productId
module.exports.createReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = res.locals.clientUser;

        if (!user) {
            return res.json({ code: 401, message: "Vui lòng đăng nhập!" });
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findOne({
            _id: productId,
            deleted: false
        });

        if (!product) {
            return res.json({ code: 404, message: "Sản phẩm không tồn tại!" });
        }

        // Kiểm tra đã mua sản phẩm chưa (đơn hàng delivered)
        const hasPurchased = await Order.findOne({
            userId: user._id.toString(),
            "items.productId": productId,
            status: "delivered",
            deleted: false
        });

        if (!hasPurchased) {
            return res.json({ code: 403, message: "Bạn cần mua sản phẩm này trước khi đánh giá!" });
        }

        // Kiểm tra đã đánh giá chưa
        const existingReview = await Review.findOne({
            productId: productId,
            userId: user._id.toString(),
            deleted: false
        });

        if (existingReview) {
            return res.json({ code: 400, message: "Bạn đã đánh giá sản phẩm này rồi!" });
        }

        // Tạo review mới
        const review = new Review({
            productId: productId,
            userId: user._id.toString(),
            userName: user.fullName,
            userAvatar: user.avatar || "",
            rating: parseInt(req.body.rating) || 5,
            comment: req.body.comment || ""
        });

        await review.save();

        res.json({ code: 200, message: "Đánh giá thành công!" });
    } catch (error) {
        console.log("Create review error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra!" });
    }
};
