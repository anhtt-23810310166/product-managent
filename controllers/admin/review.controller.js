const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// [GET] /admin/reviews
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.userName = objectSearch.regex;
        }

        // Filter by rating
        if (req.query.rating) {
            find.rating = parseInt(req.query.rating);
        }

        // Pagination
        const totalItems = await Review.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const reviews = await Review.find(find)
            .sort({ createdAt: -1 })
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Lấy tên sản phẩm cho mỗi review
        const productIds = [...new Set(reviews.map(r => r.productId))];
        const products = await Product.find({ _id: { $in: productIds } }).select("title slug");
        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        res.render("admin/pages/reviews/index", {
            pageTitle: "Quản lý đánh giá",
            currentPage: "reviews",
            breadcrumbs: [
                { title: "Đánh giá sản phẩm" }
            ],
            reviews: reviews,
            productMap: productMap,
            keyword: objectSearch.keyword,
            pagination: objectPagination,
            selectedRating: req.query.rating || ""
        });
    } catch (error) {
        console.log("Admin reviews error:", error);
        res.redirect("back");
    }
};

// [DELETE] /admin/reviews/delete/:id
module.exports.deleteReview = async (req, res) => {
    try {
        await Review.updateOne(
            { _id: req.params.id },
            { deleted: true, deletedAt: new Date() }
        );

        res.json({ code: 200, message: "Xoá đánh giá thành công!" });
    } catch (error) {
        console.log("Delete review error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra!" });
    }
};
