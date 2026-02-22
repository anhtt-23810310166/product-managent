const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const articleRoutes = require("./article.route");
const cartRoutes = require("./cart.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const authMiddleware = require("../../middlewares/client/auth.middleware");

module.exports = (app) => {
    // Middleware lấy danh mục cho menu chung
    app.use(categoryMiddleware.categoryMiddleware);

    // Middleware xác thực user (gắn res.locals.clientUser nếu đã đăng nhập)
    // Phải chạy TRƯỚC cart middleware để cart có thể gắn userId
    app.use(authMiddleware.authMiddleware);

    // Middleware giỏ hàng (đếm tổng số lượng cho header)
    app.use(cartMiddleware.cartMiddleware);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/articles", articleRoutes);

    app.use("/cart", cartRoutes);

    app.use("/user", userRoutes);

    app.use("/chat", chatRoutes);
}