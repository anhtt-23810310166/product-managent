const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./product-category.route");
const settingRoutes = require("./setting.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const PATH_ADMIN = app.locals.prefixAdmin;

    // Auth routes (public - no middleware)
    app.use(`${PATH_ADMIN}/auth`, authRoutes);

    // Protected routes (require login)
    app.use(`${PATH_ADMIN}/dashboard`, authMiddleware.requireAuth, dashboardRoutes);
    app.use(`${PATH_ADMIN}/products`, authMiddleware.requireAuth, productRoutes);
    app.use(`${PATH_ADMIN}/product-category`, authMiddleware.requireAuth, productCategoryRoutes);
    app.use(`${PATH_ADMIN}/settings`, authMiddleware.requireAuth, settingRoutes);
    app.use(`${PATH_ADMIN}/roles`, authMiddleware.requireAuth, roleRoutes);
    app.use(`${PATH_ADMIN}/accounts`, authMiddleware.requireAuth, accountRoutes);
}
