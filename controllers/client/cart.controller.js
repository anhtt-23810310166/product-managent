const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const {
    getDiscountedPrice,
    getCartTotalQuantity,
    calculateCartTotal
} = require("../../helpers/product");

// Helper: Lấy cartItems và cartTotal từ Cart document
const getCartDetails = async (cart) => {
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({
        _id: { $in: productIds },
        deleted: false
    });

    const cartItems = [];
    let cartTotal = 0;

    for (const item of cart.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const unitPrice = getDiscountedPrice(product);
            const itemTotal = unitPrice * item.quantity;
            cartTotal += itemTotal;

            cartItems.push({
                product,
                quantity: item.quantity,
                unitPrice,
                itemTotal
            });
        }
    }

    return { cartItems, cartTotal };
};

// [GET] /cart
module.exports.index = async (req, res) => {
    try {
        const cart = req.cart; // Middleware đã gán sẵn

        const { cartItems, cartTotal } = await getCartDetails(cart);

        res.render("client/pages/cart/index", {
            title: "Giỏ hàng",
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.log("Cart index error:", error);
        res.render("client/pages/cart/index", {
            title: "Giỏ hàng",
            cartItems: [],
            cartTotal: 0
        });
    }
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findOne({
            _id: productId,
            status: "active",
            deleted: false
        });

        if (!product) {
            return res.redirect("back");
        }

        const cart = req.cart;

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        if (existingItem) {
            // Đã có -> cộng thêm số lượng
            await Cart.updateOne(
                { _id: cart._id, "items.productId": productId },
                { $inc: { "items.$.quantity": quantity } }
            );
        } else {
            // Chưa có -> thêm mới
            await Cart.updateOne(
                { _id: cart._id },
                { $push: { items: { productId, quantity } } }
            );
        }

        req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");
        res.redirect("back");
    } catch (error) {
        console.log("Add to cart error:", error);
        res.redirect("back");
    }
};

// [PATCH] /cart/update/:productId (AJAX)
module.exports.update = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity);

        if (!quantity || quantity < 1) {
            return res.json({ success: false, message: "Số lượng không hợp lệ" });
        }

        const cart = req.cart;

        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        if (!existingItem) {
            return res.json({ success: false, message: "Sản phẩm không tồn tại trong giỏ" });
        }

        // Cập nhật số lượng trong DB
        await Cart.updateOne(
            { _id: cart._id, "items.productId": productId },
            { $set: { "items.$.quantity": quantity } }
        );

        // Tính lại tổng
        const product = await Product.findById(productId);
        const unitPrice = getDiscountedPrice(product);
        const itemTotal = unitPrice * quantity;

        // Lấy cart mới từ DB để tính tổng chính xác
        const updatedCart = await Cart.findById(cart._id);
        const productIds = updatedCart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(updatedCart.items, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(updatedCart.items),
            itemTotal,
            cartTotal
        });
    } catch (error) {
        console.log("Update cart error:", error);
        res.json({ success: false, message: "Lỗi cập nhật" });
    }
};

// [DELETE] /cart/remove/:productId (AJAX)
module.exports.remove = async (req, res) => {
    try {
        const productId = req.params.productId;

        const cart = req.cart;

        // Xóa item khỏi giỏ trong DB
        await Cart.updateOne(
            { _id: cart._id },
            { $pull: { items: { productId: productId } } }
        );

        // Lấy cart mới từ DB để tính tổng
        const updatedCart = await Cart.findById(cart._id);
        const productIds = updatedCart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(updatedCart.items, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(updatedCart.items),
            cartTotal
        });
    } catch (error) {
        console.log("Remove from cart error:", error);
        res.json({ success: false, message: "Lỗi xóa sản phẩm" });
    }
};

// [GET] /cart/checkout
module.exports.checkout = async (req, res) => {
    try {
        const cart = req.cart;

        if (cart.items.length === 0) {
            return res.redirect("/cart");
        }

        const { cartItems, cartTotal } = await getCartDetails(cart);

        res.render("client/pages/cart/checkout", {
            title: "Thanh toán",
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.log("Checkout error:", error);
        res.redirect("/cart");
    }
};

// [POST] /cart/checkout
module.exports.checkoutPost = async (req, res) => {
    try {
        const cart = req.cart;

        if (cart.items.length === 0) {
            req.flash("error", "Giỏ hàng trống!");
            return res.redirect("/cart");
        }

        const { customerName, customerPhone, customerAddress, customerNote } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            req.flash("error", "Vui lòng điền đầy đủ thông tin!");
            return res.redirect("/cart/checkout");
        }

        // Lấy thông tin sản phẩm
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false
        });

        const items = [];
        let totalAmount = 0;

        for (const cartItem of cart.items) {
            const product = products.find(p => p.id === cartItem.productId);
            if (product) {
                const unitPrice = getDiscountedPrice(product);
                const itemTotal = unitPrice * cartItem.quantity;
                totalAmount += itemTotal;

                items.push({
                    productId: product._id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    discountPercentage: product.discountPercentage || 0,
                    unitPrice,
                    quantity: cartItem.quantity,
                    itemTotal
                });

                // Trừ stock
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { stock: -cartItem.quantity } }
                );
            }
        }

        // Tạo đơn hàng
        const order = new Order({
            userId: res.locals.clientUser ? res.locals.clientUser.id : "",
            customerName,
            customerPhone,
            customerAddress,
            customerNote: customerNote || "",
            items,
            totalAmount
        });
        await order.save();

        // Xóa giỏ hàng trong DB (chỉ xóa items, giữ lại Cart)
        await Cart.updateOne(
            { _id: cart._id },
            { $set: { items: [] } }
        );

        res.render("client/pages/cart/checkout-success", {
            title: "Đặt hàng thành công",
            order
        });
    } catch (error) {
        console.log("Checkout post error:", error);
        req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
        res.redirect("/cart/checkout");
    }
};
