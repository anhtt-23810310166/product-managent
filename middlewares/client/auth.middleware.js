// Kế thừa pattern từ middlewares/admin/auth.middleware.js

const User = require("../../models/user.model");

// [Global Middleware] Gắn clientUser vào res.locals nếu đã đăng nhập
module.exports.authMiddleware = async (req, res, next) => {
    if (req.session.userToken) {
        try {
            const user = await User.findOne({
                token: req.session.userToken,
                status: "active",
                deleted: false
            }).select("-password");

            if (user) {
                res.locals.clientUser = user;
            } else {
                // Token không hợp lệ → xóa session
                req.session.userToken = null;
            }
        } catch (error) {
            console.log("Client auth middleware error:", error);
            req.session.userToken = null;
        }
    }

    next();
};

// [Middleware] Yêu cầu đăng nhập — kế thừa pattern từ admin requireAuth
module.exports.requireAuth = (req, res, next) => {
    if (!res.locals.clientUser) {
        req.flash("error", "Vui lòng đăng nhập để tiếp tục!");
        return res.redirect("/user/login");
    }

    next();
};
