const Article = require("../../models/article.model");
const ArticleCategory = require("../../models/article-category.model");
const createTree = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/articles
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Filter status
        const filterStatus = filterStatusHelper(req.query);
        if (req.query.status) {
            find.status = req.query.status;
        }

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.title = objectSearch.regex;
        }

        // Sort
        const sort = sortHelper(req.query, [
            { value: "position-asc", label: "Vị trí tăng dần" },
            { value: "position-desc", label: "Vị trí giảm dần" },
            { value: "title-asc", label: "Tiêu đề A-Z" },
            { value: "title-desc", label: "Tiêu đề Z-A" },
            { value: "createdAt-desc", label: "Mới nhất" },
            { value: "createdAt-asc", label: "Cũ nhất" }
        ]);

        // Pagination
        const totalItems = await Article.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems);

        const articles = await Article.find(find)
            .sort(sort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Lấy danh mục
        const categories = await ArticleCategory.find({ deleted: false });
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat._id.toString()] = cat.title;
        });

        res.render("admin/pages/articles/index", {
            pageTitle: "Danh sách bài viết",
            currentPage: "articles",
            breadcrumbs: [{ title: "Bài viết" }, { title: "Danh sách" }],
            articles: articles,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: sort.sortOptions,
            pagination: objectPagination,
            categoryMap: categoryMap
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/articles/create
module.exports.create = async (req, res) => {
    try {
        const categories = await ArticleCategory.find({ deleted: false, status: "active" });
        const categoryTree = createTree(categories);

        res.render("admin/pages/articles/create", {
            pageTitle: "Thêm bài viết",
            currentPage: "article-create",
            breadcrumbs: [{ title: "Bài viết", link: `${prefixAdmin}/articles` }, { title: "Thêm mới" }],
            categories: categoryTree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/articles`);
    }
};

// [POST] /admin/articles/create
module.exports.createPost = async (req, res) => {
    try {
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await Article.countDocuments({ deleted: false });
            req.body.position = count + 1;
        }

        const article = new Article(req.body);
        await article.save();

        createLog(req, res, {
            action: "create",
            module: "articles",
            description: `Thêm bài viết: ${article.title}`
        });

        req.flash("success", "Thêm bài viết thành công!");
        res.redirect(`${prefixAdmin}/articles`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Thêm bài viết thất bại!");
        res.redirect("back");
    }
};

// [GET] /admin/articles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const article = await Article.findOne({ _id: req.params.id, deleted: false });
        if (!article) {
            req.flash("error", "Bài viết không tồn tại!");
            return res.redirect(`${prefixAdmin}/articles`);
        }

        const categories = await ArticleCategory.find({ deleted: false, status: "active" });
        const categoryTree = createTree(categories);

        res.render("admin/pages/articles/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            currentPage: "articles",
            breadcrumbs: [{ title: "Bài viết", link: `${prefixAdmin}/articles` }, { title: "Chỉnh sửa" }],
            article: article,
            categories: categoryTree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/articles`);
    }
};

// [PATCH] /admin/articles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        }

        await Article.updateOne({ _id: req.params.id }, req.body);

        createLog(req, res, {
            action: "edit",
            module: "articles",
            description: `Chỉnh sửa bài viết: ${req.body.title}`
        });

        req.flash("success", "Cập nhật bài viết thành công!");
        res.redirect(`${prefixAdmin}/articles`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật thất bại!");
        res.redirect("back");
    }
};

// [PATCH] /admin/articles/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const result = await Article.updateOne({ _id: id }, { status: status });

        if (result.modifiedCount > 0) {
            createLog(req, res, {
                action: "change-status",
                module: "articles",
                description: `Đổi trạng thái bài viết sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
            });

            res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log(error);
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
};

// [PATCH] /admin/articles/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type, value } = req.body;
        let count = 0;

        switch (type) {
            case "active":
            case "inactive": {
                const result = await Article.updateMany(
                    { _id: { $in: ids } },
                    { status: type }
                );
                count = result.modifiedCount;
                break;
            }
            case "delete": {
                const result = await Article.updateMany(
                    { _id: { $in: ids } },
                    { deleted: true, deletedAt: new Date() }
                );
                count = result.modifiedCount;
                break;
            }
            case "change-position": {
                for (const item of value) {
                    await Article.updateOne({ _id: item.id }, { position: item.position });
                }
                count = value.length;
                break;
            }
        }

        if (count > 0) {
            createLog(req, res, {
                action: "change-multi",
                module: "articles",
                description: `Thao tác hàng loạt [${type}] trên ${count} bài viết`
            });
        }

        res.json({
            code: 200,
            message: count > 0 ? "Cập nhật thành công!" : "Không có thay đổi nào!",
            count: count
        });
    } catch (error) {
        console.log(error);
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
};

// [DELETE] /admin/articles/delete/:id
module.exports.deleteArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Article.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

        if (result.modifiedCount > 0) {
            createLog(req, res, {
                action: "delete",
                module: "articles",
                description: `Xoá bài viết (ID: ${id})`
            });

            res.json({ code: 200, message: "Xoá bài viết thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log(error);
        res.json({ code: 400, message: "Xoá bài viết thất bại!" });
    }
};
