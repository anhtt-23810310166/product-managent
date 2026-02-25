const Account = require("../../models/account.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session.token) {
        return res.redirect(`${prefixAdmin}/dashboard`);
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

        // So sánh mật khẩu bằng bcrypt
        if (!bcrypt.compareSync(password, account.password)) {
            req.flash("error", "Sai mật khẩu!");
            return res.redirect("back");
        }

        if (account.status === "inactive") {
            req.flash("error", "Tài khoản đã bị khóa!");
            return res.redirect("back");
        }

        // Tạo JWT token và lưu vào session
        const token = jwt.sign(
            { id: account._id, email: account.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        req.session.token = token;

        // Ghi log đăng nhập
        res.locals.user = account;
        createLog(req, res, {
            action: "login",
            module: "auth",
            description: `Đăng nhập hệ thống`
        });

        res.redirect(`${prefixAdmin}/dashboard`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/auth/logout
module.exports.logout = (req, res) => {
    createLog(req, res, {
        action: "logout",
        module: "auth",
        description: `Đăng xuất hệ thống`
    });

    req.session.token = null;
    res.redirect(`${prefixAdmin}/auth/login`);
};
