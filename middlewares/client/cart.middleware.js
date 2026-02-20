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

        // Gắn userId vào cart nếu user đã đăng nhập
        if (res.locals.clientUser && req.cart.userId !== res.locals.clientUser.id) {
            req.cart.userId = res.locals.clientUser.id;
            await req.cart.save();
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

