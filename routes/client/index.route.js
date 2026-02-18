const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const articleRoutes = require("./article.route");
const cartRoutes = require("./cart.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");

module.exports = (app) => {
    // Middleware lấy danh mục cho menu chung
    app.use(categoryMiddleware.categoryMiddleware);

    // Middleware giỏ hàng (đếm tổng số lượng cho header)
    app.use(cartMiddleware.cartMiddleware);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/articles", articleRoutes);

    app.use("/cart", cartRoutes);
}