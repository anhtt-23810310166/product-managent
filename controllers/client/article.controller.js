const Article = require("../../models/article.model");
const ArticleCategory = require("../../models/article-category.model");

// Helper: lấy tất cả ID con cháu của 1 category
const getDescendantIds = async (parentId) => {
    const children = await ArticleCategory.find({
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

// [GET] /articles
module.exports.index = async (req, res) => {
    try {
        const find = {
            status: "active",
            deleted: false
        };

        let currentCategory = null;

        // Lọc theo danh mục
        if (req.query.category) {
            const category = await ArticleCategory.findOne({
                slug: req.query.category,
                status: "active",
                deleted: false
            });

            if (category) {
                currentCategory = category;
                // Lấy tất cả ID con cháu
                const descendantIds = await getDescendantIds(category.id);
                const allCategoryIds = [category.id, ...descendantIds];
                find.article_category_id = { $in: allCategoryIds };
            }
        }

        const articles = await Article.find(find)
            .sort({ position: "desc", createdAt: -1 });

        res.render("client/pages/articles/index", {
            title: currentCategory ? currentCategory.title : "Bài viết",
            articles,
            currentCategory
        });
    } catch (error) {
        console.log(error);
        res.render("client/pages/articles/index", {
            title: "Bài viết",
            articles: [],
            currentCategory: null
        });
    }
};

// [GET] /articles/:slug
module.exports.detail = async (req, res) => {
    try {
        const article = await Article.findOne({
            slug: req.params.slug,
            status: "active",
            deleted: false
        });

        if (!article) {
            return res.redirect("/articles");
        }

        // Bài viết liên quan (cùng danh mục)
        let relatedArticles = [];
        if (article.article_category_id) {
            relatedArticles = await Article.find({
                article_category_id: article.article_category_id,
                _id: { $ne: article._id },
                status: "active",
                deleted: false
            }).sort({ createdAt: -1 }).limit(4);
        }

        res.render("client/pages/articles/detail", {
            title: article.title,
            article,
            relatedArticles
        });
    } catch (error) {
        console.log(error);
        res.redirect("/articles");
    }
};
