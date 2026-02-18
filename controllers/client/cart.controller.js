const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const {
    getDiscountedPrice,
    getCartTotalQuantity,
    calculateCartTotal
} = require("../../helpers/product");

// [GET] /cart
module.exports.index = async (req, res) => {
    try {
        const cart = req.session.cart || [];

        // Lấy thông tin sản phẩm từ DB
        const productIds = cart.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false
        });

        // Map cart items với product info
        const cartItems = [];
        let cartTotal = 0;

        for (const item of cart) {
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

        // Khởi tạo cart nếu chưa có
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingIndex = req.session.cart.findIndex(
            item => item.productId === productId
        );

        if (existingIndex > -1) {
            req.session.cart[existingIndex].quantity += quantity;
        } else {
            req.session.cart.push({ productId, quantity });
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

        if (!req.session.cart) {
            return res.json({ success: false, message: "Giỏ hàng trống" });
        }

        const itemIndex = req.session.cart.findIndex(
            item => item.productId === productId
        );

        if (itemIndex === -1) {
            return res.json({ success: false, message: "Sản phẩm không tồn tại trong giỏ" });
        }

        // Cập nhật số lượng
        req.session.cart[itemIndex].quantity = quantity;

        // Tính lại tổng
        const product = await Product.findById(productId);
        const unitPrice = getDiscountedPrice(product);
        const itemTotal = unitPrice * quantity;

        // Tính tổng giỏ hàng (dùng helper chung)
        const productIds = req.session.cart.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(req.session.cart, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(req.session.cart),
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

        if (!req.session.cart) {
            return res.json({ success: false, message: "Giỏ hàng trống" });
        }

        req.session.cart = req.session.cart.filter(
            item => item.productId !== productId
        );

        // Tính lại tổng giỏ hàng (dùng helper chung)
        const productIds = req.session.cart.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, deleted: false });
        const cartTotal = calculateCartTotal(req.session.cart, products);

        res.json({
            success: true,
            cartTotalQuantity: getCartTotalQuantity(req.session.cart),
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
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.redirect("/cart");
        }

        const productIds = cart.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false
        });

        const cartItems = [];
        let cartTotal = 0;

        for (const item of cart) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const unitPrice = getDiscountedPrice(product);
                const itemTotal = unitPrice * item.quantity;
                cartTotal += itemTotal;
                cartItems.push({ product, quantity: item.quantity, unitPrice, itemTotal });
            }
        }

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
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            req.flash("error", "Giỏ hàng trống!");
            return res.redirect("/cart");
        }

        const { customerName, customerPhone, customerAddress, customerNote } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            req.flash("error", "Vui lòng điền đầy đủ thông tin!");
            return res.redirect("/cart/checkout");
        }

        // Lấy thông tin sản phẩm
        const productIds = cart.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false
        });

        const items = [];
        let totalAmount = 0;

        for (const cartItem of cart) {
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
            customerName,
            customerPhone,
            customerAddress,
            customerNote: customerNote || "",
            items,
            totalAmount
        });
        await order.save();

        // Xóa giỏ hàng
        req.session.cart = [];

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
