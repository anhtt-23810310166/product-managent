const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");

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
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue === "desc" ? -1 : 1;
    } else {
        sort.position = -1;
    }

    // Sort Options
    const sortOptions = [
        { value: "position-desc", label: "Vị trí giảm dần" },
        { value: "position-asc", label: "Vị trí tăng dần" },
        { value: "price-desc", label: "Giá giảm dần" },
        { value: "price-asc", label: "Giá tăng dần" },
        { value: "title-asc", label: "Tiêu đề A - Z" },
        { value: "title-desc", label: "Tiêu đề Z - A" }
    ];

    const products = await Product.find(find).sort(sort);

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        currentPage: "products",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        sortOptions: sortOptions
    });
}