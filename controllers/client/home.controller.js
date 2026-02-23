const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Article = require("../../models/article.model");

// [GET] /
module.exports.index = async (req, res) => {
    try {
        // Sản phẩm nổi bật
        const featuredProducts = await Product.find({
            featured: true,
            status: "active",
            deleted: false
        }).sort({ position: "desc" }).limit(4);

        // Sản phẩm mới nhất
        const newestProducts = await Product.find({
            status: "active",
            deleted: false
        }).sort({ createdAt: -1 }).limit(4);

        // Bài viết nổi bật
        const featuredArticles = await Article.find({
            featured: true,
            status: "active",
            deleted: false
        }).sort({ createdAt: -1 }).limit(6);

        res.render("client/pages/home/index", {
            title: "Trang chủ",
            featuredProducts,
            newestProducts,
            featuredArticles
        });
    } catch (error) {
        console.log(error);
        res.render("client/pages/home/index", {
            title: "Trang chủ",
            featuredProducts: [],
            newestProducts: [],
            featuredArticles: []
        });
    }
}