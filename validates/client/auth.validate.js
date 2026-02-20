// Kế thừa pattern từ validates/admin/auth.validate.js

// [POST] /user/register
module.exports.registerPost = (req, res, next) => {
    if (!req.body.fullName || req.body.fullName.trim() === "") {
        req.flash("error", "Vui lòng nhập họ tên!");
        return res.redirect("back");
    }

    if (!req.body.email || req.body.email.trim() === "") {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect("back");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        req.flash("error", "Email không đúng định dạng!");
        return res.redirect("back");
    }

    if (!req.body.password || req.body.password.trim() === "") {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        return res.redirect("back");
    }

    if (req.body.password.length < 6) {
        req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
        return res.redirect("back");
    }

    if (req.body.password !== req.body.confirmPassword) {
        req.flash("error", "Xác nhận mật khẩu không khớp!");
        return res.redirect("back");
    }

    next();
};

// [POST] /user/login — kế thừa y nguyên từ admin
module.exports.loginPost = (req, res, next) => {
    if (!req.body.email || req.body.email.trim() === "") {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect("back");
    }

    if (!req.body.password || req.body.password.trim() === "") {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        return res.redirect("back");
    }

    next();
};
