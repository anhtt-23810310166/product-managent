module.exports.createPost = (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === "") {
        req.flash("error", "Tên danh mục không được để trống!");
        return res.redirect("back");
    }

    if (req.body.position !== "" && req.body.position !== undefined) {
        const position = parseFloat(req.body.position);
        if (isNaN(position) || position < 1) {
            req.flash("error", "Vị trí phải là số >= 1!");
            return res.redirect("back");
        }
    }

    next();
};

module.exports.editPatch = (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === "") {
        req.flash("error", "Tên danh mục không được để trống!");
        return res.redirect("back");
    }

    if (req.body.position !== "" && req.body.position !== undefined) {
        const position = parseFloat(req.body.position);
        if (isNaN(position) || position < 1) {
            req.flash("error", "Vị trí phải là số >= 1!");
            return res.redirect("back");
        }
    }

    next();
};
