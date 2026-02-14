const Product = require("../../models/product.model");

// [GET] /products
module.exports.index = async (req, res) => {
    const products = await Product.find({
        deleted: false
    });

    res.render("client/pages/products/index", {
        title: "Trang sản phẩm",
        products: products
    });
}

// [GET] /products/detail/:slug
module.exports.detail = async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            deleted: false
        });

        if (!product) {
            return res.redirect("/products");
        }

        res.render("client/pages/products/detail", {
            title: product.title,
            product: product
        });
    } catch (error) {
        res.redirect("/products");
    }
}