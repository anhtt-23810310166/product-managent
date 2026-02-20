// Kế thừa pattern từ controllers/admin/auth.controller.js

const User = require("../../models/user.model");
const md5 = require("md5");
const crypto = require("crypto");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");

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
    req.session = null;
    res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/auth/forgot-password", {
        pageTitle: "Quên mật khẩu"
    });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Email không tồn tại!");
        return res.redirect("back");
    }

    // Tạo OTP 6 số
    const otp = generateHelper.generateRandomNumber(6);

    // Lưu OTP và thời gian hết hạn (5 phút) vào DB
    const timeExpire = 5;
    await User.updateOne({ _id: user.id }, {
        otpPassword: otp,
        otpPasswordTimeExpire: Date.now() + timeExpire * 60 * 1000,
    });

    // Gửi email
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP xác minh lấy lại mật khẩu của bạn là <b style="color: green;">${otp}</b>. Thời hạn sử dụng là ${timeExpire} phút. Lưu ý không được để lộ mã OTP.
    `;
    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;
    res.render("client/pages/auth/otp-password", {
        pageTitle: "Nhập mã OTP",
        email: email
    });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const user = await User.findOne({
        email: email,
        otpPassword: otp
    });

    if (!user) {
        req.flash("error", "OTP không hợp lệ!");
        return res.redirect("back");
    }

    if (user.otpPasswordTimeExpire < Date.now()) {
        req.flash("error", "OTP đã hết hạn!");
        return res.redirect("back");
    }

    // OTP đúng -> lưu token vào session để xác thực bước đổi pass
    req.session.tokenUser = user.token;
    res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    if (!req.session.tokenUser) {
        return res.redirect("/");
    }
    res.render("client/pages/auth/reset-password", {
        pageTitle: "Đổi mật khẩu mới"
    });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const user = await User.findOne({
        token: req.session.tokenUser
    });

    if (!user) {
        req.flash("error", "Lỗi xác thực!");
        return res.redirect("/");
    }

    await User.updateOne(
        { _id: user.id },
        {
            password: md5(req.body.password),
            otpPassword: "",
        }
    );

    req.session.tokenUser = null;
    req.flash("success", "Đổi mật khẩu thành công!");
    res.redirect("/user/login");
};

