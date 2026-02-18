const ProductCategory = require("../../models/product-category.model");
const ArticleCategory = require("../../models/article-category.model");

// Hàm xây dựng cây phân cấp từ danh sách phẳng
const buildTree = (items, parentId = "") => {
    const tree = [];
    for (const item of items) {
        if (item.parent_id === parentId) {
            const children = buildTree(items, item.id);
            tree.push({
                _id: item._id,
                title: item.title,
                slug: item.slug,
                thumbnail: item.thumbnail,
                children: children
            });
        }
    }
    return tree;
};

// [Middleware] Lấy danh mục sản phẩm & bài viết cho menu client
module.exports.categoryMiddleware = async (req, res, next) => {
    try {
        // Lấy danh mục sản phẩm (active, chưa xóa)
        const productCategories = await ProductCategory.find({
            status: "active",
            deleted: false
        }).sort({ position: "asc" });

        // Lấy danh mục bài viết (active, chưa xóa)
        const articleCategories = await ArticleCategory.find({
            status: "active",
            deleted: false
        }).sort({ position: "asc" });

        // Xây dựng cây phân cấp
        res.locals.productCategories = buildTree(productCategories);
        res.locals.articleCategories = buildTree(articleCategories);
    } catch (error) {
        console.log("Category middleware error:", error);
        res.locals.productCategories = [];
        res.locals.articleCategories = [];
    }

    next();
};
