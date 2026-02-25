const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./product-category.route");
const brandRoutes = require("./brand.route");
const articleRoutes = require("./article.route");
const articleCategoryRoutes = require("./article-category.route");
const settingRoutes = require("./setting.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");
const activityLogRoutes = require("./activity-log.route");
const profileRoutes = require("./profile.route");
const orderRoutes = require("./order.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const reviewRoutes = require("./review.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const PATH_ADMIN = app.locals.prefixAdmin;

    // Middleware gắn prefixAdmin vào res.locals cho tất cả route admin
    app.use(PATH_ADMIN, (req, res, next) => {
        res.locals.prefixAdmin = PATH_ADMIN;
        next();
    });

    // ===== Route Public (không cần đăng nhập) =====
    app.use(`${PATH_ADMIN}/auth`, authRoutes);

    // ===== Route Private (yêu cầu đăng nhập) =====
    app.use(PATH_ADMIN, authMiddleware.requireAuth);

    // Dashboard - ai đăng nhập cũng truy cập được
    app.use(`${PATH_ADMIN}/dashboard`, dashboardRoutes);
    app.use(`${PATH_ADMIN}/activity-logs`, activityLogRoutes);
    app.use(`${PATH_ADMIN}/profile`, profileRoutes);

    // Cài đặt chung - cần quyền settings_view
    app.use(
        `${PATH_ADMIN}/settings`,
        authMiddleware.requirePermission("settings_view"),
        settingRoutes
    );

    // Quản lý sản phẩm - cần quyền products_view
    app.use(
        `${PATH_ADMIN}/products`,
        authMiddleware.requirePermission("products_view"),
        productRoutes
    );

    // Quản lý danh mục sản phẩm - cần quyền product-category_view
    app.use(
        `${PATH_ADMIN}/product-category`,
        authMiddleware.requirePermission("product-category_view"),
        productCategoryRoutes
    );

    // Quản lý thương hiệu - cần quyền brands_view
    app.use(
        `${PATH_ADMIN}/brands`,
        authMiddleware.requirePermission("brands_view"),
        brandRoutes
    );

    // Quản lý bài viết - cần quyền articles_view
    app.use(
        `${PATH_ADMIN}/articles`,
        authMiddleware.requirePermission("articles_view"),
        articleRoutes
    );

    // Quản lý danh mục bài viết - cần quyền article-category_view
    app.use(
        `${PATH_ADMIN}/article-category`,
        authMiddleware.requirePermission("article-category_view"),
        articleCategoryRoutes
    );

    // Quản lý nhóm quyền - cần quyền roles_view
    app.use(
        `${PATH_ADMIN}/roles`,
        authMiddleware.requirePermission("roles_view"),
        roleRoutes
    );

    // Quản lý tài khoản - cần quyền accounts_view
    app.use(
        `${PATH_ADMIN}/accounts`,
        authMiddleware.requirePermission("accounts_view"),
        accountRoutes
    );

    // Quản lý đơn hàng - cần quyền orders_view
    app.use(
        `${PATH_ADMIN}/orders`,
        authMiddleware.requirePermission("orders_view"),
        orderRoutes
    );

    // Quản lý khách hàng - cần quyền users_view
    app.use(
        `${PATH_ADMIN}/users`,
        authMiddleware.requirePermission("users_view"),
        userRoutes
    );

    // Quản lý đánh giá - cần quyền reviews_view
    app.use(
        `${PATH_ADMIN}/reviews`,
        authMiddleware.requirePermission("reviews_view"),
        reviewRoutes
    );

    // Hỗ trợ khách hàng (Inbox chat) - cần quyền chat_view
    app.use(
        `${PATH_ADMIN}/chat`,
        authMiddleware.requirePermission("chat_view"),
        chatRoutes
    );
}
