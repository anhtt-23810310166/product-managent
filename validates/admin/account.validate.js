module.exports.createPost = (req, res, next) => {
    if (!req.body.fullName || req.body.fullName.trim() === "") {
        req.flash("error", "Họ tên không được để trống!");
        return res.redirect("back");
    }

    if (!req.body.email || req.body.email.trim() === "") {
        req.flash("error", "Email không được để trống!");
        return res.redirect("back");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        req.flash("error", "Email không đúng định dạng!");
        return res.redirect("back");
    }

    if (!req.body.password || req.body.password.trim() === "") {
        req.flash("error", "Mật khẩu không được để trống!");
        return res.redirect("back");
    }

    next();
};

module.exports.editPatch = (req, res, next) => {
    if (!req.body.fullName || req.body.fullName.trim() === "") {
        req.flash("error", "Họ tên không được để trống!");
        return res.redirect("back");
    }

    if (!req.body.email || req.body.email.trim() === "") {
        req.flash("error", "Email không được để trống!");
        return res.redirect("back");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        req.flash("error", "Email không đúng định dạng!");
        return res.redirect("back");
    }

    next();
};
