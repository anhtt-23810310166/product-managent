const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    // Filter Status
    const filterStatus = filterStatusHelper(req.query);
    const find = { deleted: false };

    if (req.query.status) {
        find.status = req.query.status;
    }

    // Search
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    // Sort
    const objectSort = sortHelper(req.query);

    const products = await Product.find(find).sort(objectSort.sortObject);

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        currentPage: "products",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        sortOptions: objectSort.sortOptions
    });
}
