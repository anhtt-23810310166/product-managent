module.exports.createPost = (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === "") {
        req.flash("error", "Tên sản phẩm không được để trống!");
        return res.redirect("back");
    }

    if (req.body.price !== "" && req.body.price !== undefined) {
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
            req.flash("error", "Giá sản phẩm phải là số >= 0!");
            return res.redirect("back");
        }
    }

    if (req.body.discountPercentage !== "" && req.body.discountPercentage !== undefined) {
        const discount = parseFloat(req.body.discountPercentage);
        if (isNaN(discount) || discount < 0 || discount > 100) {
            req.flash("error", "Giảm giá phải từ 0 đến 100!");
            return res.redirect("back");
        }
    }

    if (req.body.stock !== "" && req.body.stock !== undefined) {
        const stock = parseFloat(req.body.stock);
        if (isNaN(stock) || stock < 0) {
            req.flash("error", "Số lượng phải là số >= 0!");
            return res.redirect("back");
        }
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
        req.flash("error", "Tên sản phẩm không được để trống!");
        return res.redirect("back");
    }

    if (req.body.price !== "" && req.body.price !== undefined) {
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
            req.flash("error", "Giá sản phẩm phải là số >= 0!");
            return res.redirect("back");
        }
    }

    if (req.body.discountPercentage !== "" && req.body.discountPercentage !== undefined) {
        const discount = parseFloat(req.body.discountPercentage);
        if (isNaN(discount) || discount < 0 || discount > 100) {
            req.flash("error", "Giảm giá phải từ 0 đến 100!");
            return res.redirect("back");
        }
    }

    if (req.body.stock !== "" && req.body.stock !== undefined) {
        const stock = parseFloat(req.body.stock);
        if (isNaN(stock) || stock < 0) {
            req.flash("error", "Số lượng phải là số >= 0!");
            return res.redirect("back");
        }
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
