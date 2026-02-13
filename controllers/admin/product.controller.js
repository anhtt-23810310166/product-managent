const Product = require("../../models/product.model");

module.exports.index = async (req, res) => {
    const products = await Product.find({ deleted: false });

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        currentPage: "products",
        products: products,
    });
}