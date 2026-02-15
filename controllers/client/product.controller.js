const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

// [GET] /products
module.exports.index = async (req, res) => {
    // Get active category IDs
    const categories = await ProductCategory.find({
        deleted: false,
        status: "active"
    });
    const activeCategoryIds = categories.map(item => item.id);

    // Get products: active, not deleted, and belonging to an active category (or uncategorized)
    const products = await Product.find({
        status: "active",
        deleted: false,
        $or: [
            { product_category_id: { $in: activeCategoryIds } },
            { product_category_id: "" },
            { product_category_id: { $exists: false } }
        ]
    }).sort({ position: "desc" });

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
            status: "active",
            deleted: false
        });

        if (!product) {
            return res.redirect("/products");
        }

        // If product has a category, check if that category is active
        if (product.product_category_id) {
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false
            });

            if (!category) {
                return res.redirect("/products"); // Category is inactive -> hide product
            }
        }

        res.render("client/pages/products/detail", {
            title: product.title,
            product: product
        });
    } catch (error) {
        res.redirect("/products");
    }
}