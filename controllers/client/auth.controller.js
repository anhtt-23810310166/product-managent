// Kế thừa pattern từ controllers/admin/auth.controller.js

const User = require("../../models/user.model");
const md5 = require("md5");
const crypto = require("crypto");

// [GET] /user/register
module.exports.register = async (req, res) => {
    // Nếu đã đăng nhập → redirect về trang chủ
    if (req.session.userToken) {
        return res.redirect("/");
    }

    res.render("client/pages/auth/register", {
        pageTitle: "Đăng ký tài khoản"
    });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Kiểm tra email đã tồn tại
        const existUser = await User.findOne({
            email: email,
            deleted: false
        });

        if (existUser) {
            req.flash("error", "Email đã được sử dụng!");
            return res.redirect("back");
        }

        // Tạo user mới (kế thừa pattern md5 + token từ admin)
        const token = crypto.randomBytes(20).toString("hex");

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: md5(password),
            token: token
        });

        await newUser.save();

        // Tự động đăng nhập sau khi đăng ký
        req.session.userToken = token;

        req.flash("success", "Đăng ký thành công!");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /user/login — kế thừa pattern từ admin auth.controller.js
module.exports.login = async (req, res) => {
    // Nếu đã đăng nhập → redirect về trang chủ
    if (req.session.userToken) {
        return res.redirect("/");
    }

    res.render("client/pages/auth/login", {
        pageTitle: "Đăng nhập"
    });
};

// [POST] /user/login — kế thừa pattern từ admin auth.controller.js
module.exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            req.flash("error", "Email không tồn tại!");
            return res.redirect("back");
        }

        if (md5(password) !== user.password) {
            req.flash("error", "Sai mật khẩu!");
            return res.redirect("back");
        }

        if (user.status === "inactive") {
            req.flash("error", "Tài khoản đã bị khóa!");
            return res.redirect("back");
        }

        // Lưu token vào session (dùng key riêng: userToken)
        req.session.userToken = user.token;

        req.flash("success", "Đăng nhập thành công!");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /user/logout — kế thừa pattern từ admin auth.controller.js
module.exports.logout = (req, res) => {
    req.session.userToken = null;
    req.flash("success", "Đăng xuất thành công!");
    res.redirect("/");
};
