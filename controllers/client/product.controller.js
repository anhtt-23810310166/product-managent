const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Brand = require("../../models/brand.model");

// Helper: lấy tất cả ID con cháu của 1 category
const getDescendantIds = async (parentId) => {
    const children = await ProductCategory.find({
        parent_id: parentId,
        status: "active",
        deleted: false
    });
    let ids = children.map(c => c.id);
    for (const child of children) {
        const subIds = await getDescendantIds(child.id);
        ids = ids.concat(subIds);
    }
    return ids;
};

// [GET] /products
module.exports.index = async (req, res) => {
    try {
        const find = {
            status: "active",
            deleted: false
        };

        let currentCategory = null;
        const keyword = req.query.keyword || "";

        let selectedBrands = [];
        if (req.query.brand) {
            if (Array.isArray(req.query.brand)) {
                selectedBrands = req.query.brand;
            } else {
                selectedBrands = [req.query.brand];
            }
        }

        // Lọc theo danh mục
        if (req.query.category) {
            const category = await ProductCategory.findOne({
                slug: req.query.category,
                status: "active",
                deleted: false
            });

            if (category) {
                currentCategory = category;
                const descendantIds = await getDescendantIds(category.id);
                const allCategoryIds = [category.id, ...descendantIds];
                find.product_category_id = { $in: allCategoryIds };
            }
        }

        // Lọc theo thương hiệu
        if (selectedBrands.length > 0) {
            const brandsFound = await Brand.find({
                slug: { $in: selectedBrands },
                status: "active",
                deleted: false
            });
            if (brandsFound.length > 0) {
                find.brand_id = { $in: brandsFound.map(b => b.id) };
            }
        }

        // Tìm kiếm theo từ khóa (kế thừa pattern từ admin search)
        if (keyword.trim()) {
            const keywordRegex = new RegExp(keyword.trim(), "i");
            find.title = keywordRegex;
        }

        // Lấy tất cả thương hiệu cho sidebar
        const allBrands = await Brand.find({
            status: "active",
            deleted: false
        }).sort({ position: "asc" });

        const products = await Product.find(find)
            .sort({ position: "desc" });

        res.render("client/pages/products/index", {
            title: keyword ? `Tìm kiếm: ${keyword}` : (currentCategory ? currentCategory.title : "Sản phẩm"),
            products,
            currentCategory,
            keyword,
            brands: allBrands,
            selectedBrands
        });
    } catch (error) {
        console.log(error);
        res.render("client/pages/products/index", {
            title: "Sản phẩm",
            products: [],
            currentCategory: null,
            keyword: "",
            brands: [],
            selectedBrands: []
        });
    }
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

        // Get brand info
        let brand = null;
        if (product.brand_id) {
            brand = await Brand.findOne({
                _id: product.brand_id,
                deleted: false
            });
        }

        res.render("client/pages/products/detail", {
            title: product.title,
            product: product,
            brand: brand
        });
    } catch (error) {
        res.redirect("/products");
    }
}