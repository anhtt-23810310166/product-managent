module.exports.createPost = (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === "") {
        req.flash("error", "Tên nhóm quyền không được để trống!");
        return res.redirect("back");
    }
    next();
};

module.exports.editPatch = (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === "") {
        req.flash("error", "Tên nhóm quyền không được để trống!");
        return res.redirect("back");
    }
    next();
};

module.exports.permissionsPatch = (req, res, next) => {
    if (!req.body.permissions) {
        req.flash("error", "Dữ liệu phân quyền không hợp lệ!");
        return res.redirect("back");
    }

    try {
        const permissions = JSON.parse(req.body.permissions);
        if (!Array.isArray(permissions)) {
            req.flash("error", "Dữ liệu phân quyền phải là một mảng!");
            return res.redirect("back");
        }
    } catch (error) {
        req.flash("error", "Dữ liệu phân quyền không đúng định dạng!");
        return res.redirect("back");
    }

    next();
};
