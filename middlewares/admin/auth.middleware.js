const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// [Middleware] Kiểm tra đăng nhập (Authentication)
module.exports.requireAuth = async (req, res, next) => {
    if (!req.session.token) {
        return res.redirect(`${prefixAdmin}/auth/login`);
    }

    try {
        const user = await Account.findOne({
            token: req.session.token,
            status: "active",
            deleted: false
        }).select("-password");

        if (!user) {
            req.session.token = null;
            return res.redirect(`${prefixAdmin}/auth/login`);
        }

        const role = await Role.findOne({
            _id: user.role_id,
            deleted: false
        }).select("title permissions");

        res.locals.user = user;
        res.locals.role = role;
        res.locals.userPermissions = role ? role.permissions : [];

        next();
    } catch (error) {
        console.log(error);
        req.session.token = null;
        res.redirect(`${prefixAdmin}/auth/login`);
    }
};

// [Middleware] Kiểm tra quyền hạn (Authorization)
// Sử dụng: authMiddleware.requirePermission("products_view")
module.exports.requirePermission = (permission) => {
    return (req, res, next) => {
        if (res.locals.userPermissions && res.locals.userPermissions.includes(permission)) {
            return next();
        }

        req.flash("error", "Bạn không có quyền truy cập trang này!");
        return res.redirect(`${prefixAdmin}/dashboard`);
    };
};

