const Account = require("../../models/account.model");
const md5 = require("md5");

// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session.token) {
        return res.redirect(`${req.app.locals.prefixAdmin}/dashboard`);
    }

    res.render("admin/pages/auth/login", {
        pageTitle: "Đăng nhập"
    });
};

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const account = await Account.findOne({
            email: email,
            deleted: false
        });

        if (!account) {
            req.flash("error", "Email không tồn tại!");
            return res.redirect("back");
        }

        if (md5(password) !== account.password) {
            req.flash("error", "Sai mật khẩu!");
            return res.redirect("back");
        }

        if (account.status === "inactive") {
            req.flash("error", "Tài khoản đã bị khóa!");
            return res.redirect("back");
        }

        // Save token to session
        req.session.token = account.token;

        res.redirect(`${req.app.locals.prefixAdmin}/dashboard`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/auth/logout
module.exports.logout = (req, res) => {
    req.session.token = null;
    res.redirect(`${req.app.locals.prefixAdmin}/auth/login`);
};
