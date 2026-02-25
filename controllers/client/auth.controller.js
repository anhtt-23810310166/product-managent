// Kế thừa pattern từ controllers/admin/auth.controller.js

const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

        // Tạo user mới với bcrypt hash
        const newUser = new User({
            fullName: fullName,
            email: email,
            password: bcrypt.hashSync(password, 10)
        });

        await newUser.save();

        // Tạo JWT token và lưu vào session
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
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

        // So sánh mật khẩu bằng bcrypt
        if (!bcrypt.compareSync(password, user.password)) {
            req.flash("error", "Sai mật khẩu!");
            return res.redirect("back");
        }

        if (user.status === "inactive") {
            req.flash("error", "Tài khoản đã bị khóa!");
            return res.redirect("back");
        }

        // Tạo JWT token và lưu vào session
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        req.session.userToken = token;

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

    // OTP đúng -> tạo JWT tạm để xác thực bước đổi pass
    const resetToken = jwt.sign(
        { id: user._id, purpose: "reset-password" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );
    req.session.tokenUser = resetToken;
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
    try {
        const decoded = jwt.verify(req.session.tokenUser, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            req.flash("error", "Lỗi xác thực!");
            return res.redirect("/");
        }

        await User.updateOne(
            { _id: user._id },
            {
                password: bcrypt.hashSync(req.body.password, 10),
                otpPassword: "",
            }
        );

        req.session.tokenUser = null;
        req.flash("success", "Đổi mật khẩu thành công!");
        res.redirect("/user/login");
    } catch (error) {
        console.log(error);
        req.session.tokenUser = null;
        req.flash("error", "Phiên đổi mật khẩu đã hết hạn!");
        res.redirect("/user/password/forgot");
    }
};

// [GET] /user/info
module.exports.info = async (req, res) => {
    res.render("client/pages/auth/info", {
        pageTitle: "Thông tin tài khoản"
    });
};

// [POST] /user/info
module.exports.infoPost = async (req, res) => {
    try {
        const updateData = {
            fullName: req.body.fullName,
            phone: req.body.phone
        };

        if (req.file) {
            updateData.avatar = req.file.path;
        }

        await User.updateOne(
            { _id: res.locals.clientUser._id },
            updateData
        );

        req.flash("success", "Cập nhật thông tin thành công!");
        res.redirect("back");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /user/password/change
module.exports.changePassword = async (req, res) => {
    res.render("client/pages/auth/change-password", {
        pageTitle: "Đổi mật khẩu"
    });
};

// [POST] /user/password/change
module.exports.changePasswordPost = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findOne({
            _id: res.locals.clientUser._id,
            deleted: false
        });

        if (!user) {
            req.flash("error", "Lỗi xác thực!");
            return res.redirect("/user/login");
        }

        // So sánh mật khẩu hiện tại bằng bcrypt
        if (!bcrypt.compareSync(currentPassword, user.password)) {
            req.flash("error", "Mật khẩu hiện tại không đúng!");
            return res.redirect("back");
        }

        await User.updateOne(
            { _id: user._id },
            { password: bcrypt.hashSync(newPassword, 10) }
        );

        req.flash("success", "Đổi mật khẩu thành công!");
        res.redirect("/user/info");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};
