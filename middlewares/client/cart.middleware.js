const Cart = require("../../models/cart.model");
const crypto = require("crypto");

// [Middleware] Cart: tạo/tìm giỏ hàng trong DB, truyền cartTotalQuantity cho header
module.exports.cartMiddleware = async (req, res, next) => {
    try {
        let cartId = req.session.cartId;

        if (!cartId) {
            // Khách mới: tạo cartId và bản ghi Cart trong DB
            cartId = crypto.randomBytes(16).toString("hex");
            req.session.cartId = cartId;

            const newCart = new Cart({ cartId, items: [] });
            await newCart.save();
            req.cart = newCart;
        } else {
            // Khách cũ: tìm Cart trong DB
            let cart = await Cart.findOne({ cartId });

            if (!cart) {
                // Cart bị xóa hoặc hết hạn -> tạo mới
                const newCart = new Cart({ cartId, items: [] });
                await newCart.save();
                req.cart = newCart;
            } else {
                req.cart = cart;
            }
        }

        // Gắn userId vào cart + merge giỏ hàng cũ nếu user đã đăng nhập
        if (res.locals.clientUser) {
            const userId = res.locals.clientUser.id;

            if (req.cart.userId !== userId) {
                // Tìm giỏ hàng cũ của user (từ lần đăng nhập trước)
                const oldCart = await Cart.findOne({
                    userId: userId,
                    _id: { $ne: req.cart._id }
                });

                if (oldCart && oldCart.items.length > 0) {
                    // Merge items từ giỏ cũ vào giỏ hiện tại
                    for (const oldItem of oldCart.items) {
                        const existingItem = req.cart.items.find(
                            item => item.productId === oldItem.productId
                        );

                        if (existingItem) {
                            // Sản phẩm đã có → cộng số lượng
                            existingItem.quantity += oldItem.quantity;
                        } else {
                            // Sản phẩm mới → thêm vào
                            req.cart.items.push({
                                productId: oldItem.productId,
                                quantity: oldItem.quantity
                            });
                        }
                    }

                    // Xóa giỏ hàng cũ
                    await Cart.deleteOne({ _id: oldCart._id });
                }

                // Gắn userId vào giỏ hiện tại
                req.cart.userId = userId;
                await req.cart.save();
            }
        }

        // Tính tổng số lượng sản phẩm cho icon giỏ hàng trên header
        const totalQuantity = req.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.locals.cartTotalQuantity = totalQuantity;

        next();
    } catch (error) {
        console.log("Cart middleware error:", error);
        res.locals.cartTotalQuantity = 0;
        next();
    }
};

