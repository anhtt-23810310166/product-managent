const Product = require("../../models/product.model");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    const find = { deleted: false };

    // Filter by status
    if (req.query.status) {
        find.status = req.query.status;
    }

    // Search by keyword
    if (req.query.keyword) {
        const regex = new RegExp(req.query.keyword, "i");
        find.title = regex;
    }

    // Sort
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue === "desc" ? -1 : 1;
    } else {
        sort.position = -1; // Default sort
    }

    const products = await Product.find(find).sort(sort);

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        currentPage: "products",
        products: products,
    });
}