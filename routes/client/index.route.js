const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const articleRoutes = require("./article.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");

module.exports = (app) => {
    // Middleware lấy danh mục cho menu chung
    app.use(categoryMiddleware.categoryMiddleware);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/articles", articleRoutes);
}