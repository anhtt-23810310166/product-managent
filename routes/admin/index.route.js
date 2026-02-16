const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./product-category.route");
const settingRoutes = require("./setting.route");
const roleRoutes = require("./role.route");

module.exports = (app) => {
    const PATH_ADMIN = app.locals.prefixAdmin;

    app.use(`${PATH_ADMIN}/dashboard`, dashboardRoutes);
    app.use(`${PATH_ADMIN}/products`, productRoutes);
    app.use(`${PATH_ADMIN}/product-category`, productCategoryRoutes);
    app.use(`${PATH_ADMIN}/settings`, settingRoutes);
    app.use(`${PATH_ADMIN}/roles`, roleRoutes);
}
