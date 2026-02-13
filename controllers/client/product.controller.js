const Product = require("../../models/product.model");

module.exports.index = async (req, res) => {
    const products = await Product.find({
        deleted: false
    });

    

    res.render("client/pages/products/index", {
        title: "Trang sản phẩm",
        products: products
    });
}