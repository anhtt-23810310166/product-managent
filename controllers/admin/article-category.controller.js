const ArticleCategory = require("../../models/article-category.model");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createTree = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const createLog = require("../../helpers/activityLog");

// [GET] /admin/article-category
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        const filterStatus = filterStatusHelper(req.query);
        if (req.query.status) {
            find.status = req.query.status;
        }

        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.title = objectSearch.regex;
        }

        const sort = sortHelper(req.query, [
            { value: "position-asc", label: "Vị trí tăng dần" },
            { value: "position-desc", label: "Vị trí giảm dần" },
            { value: "title-asc", label: "Tiêu đề A-Z" },
            { value: "title-desc", label: "Tiêu đề Z-A" }
        ]);

        const categories = await ArticleCategory.find(find).sort(sort.sortObject);
        const categoryTree = createTree(categories);

        res.render("admin/pages/article-category/index", {
            pageTitle: "Danh mục bài viết",
            currentPage: "article-category",
            breadcrumbs: [{ title: "Bài viết" }, { title: "Danh mục" }],
            categories: categoryTree,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: sort.sortOptions
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/article-category/create
module.exports.create = async (req, res) => {
    try {
        const categories = await ArticleCategory.find({ deleted: false, status: "active" });
        const categoryTree = createTree(categories);

        res.render("admin/pages/article-category/create", {
            pageTitle: "Thêm danh mục bài viết",
            currentPage: "article-category",
            breadcrumbs: [
                { title: "Bài viết" },
                { title: "Danh mục", link: `${prefixAdmin}/article-category` },
                { title: "Thêm mới" }
            ],
            categories: categoryTree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/article-category`);
    }
};

// [POST] /admin/article-category/create
module.exports.createPost = async (req, res) => {
    try {
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await ArticleCategory.countDocuments({ deleted: false });
            req.body.position = count + 1;
        }

        await ArticleCategory.create(req.body);

        createLog(req, res, {
            action: "create",
            module: "article-category",
            description: `Thêm danh mục bài viết: ${req.body.title}`
        });

        req.flash("success", "Tạo danh mục thành công!");
        res.redirect(`${prefixAdmin}/article-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Tạo danh mục thất bại!");
        res.redirect("back");
    }
};

// [GET] /admin/article-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const category = await ArticleCategory.findOne({ _id: req.params.id, deleted: false });
        if (!category) {
            req.flash("error", "Danh mục không tồn tại!");
            return res.redirect(`${prefixAdmin}/article-category`);
        }

        const categories = await ArticleCategory.find({ deleted: false, status: "active" });
        const categoryTree = createTree(categories);

        res.render("admin/pages/article-category/edit", {
            pageTitle: "Chỉnh sửa danh mục",
            currentPage: "article-category",
            breadcrumbs: [
                { title: "Bài viết" },
                { title: "Danh mục", link: `${prefixAdmin}/article-category` },
                { title: "Chỉnh sửa" }
            ],
            category: category,
            categories: categoryTree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/article-category`);
    }
};

// [PATCH] /admin/article-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        }

        await ArticleCategory.updateOne({ _id: req.params.id }, req.body);

        createLog(req, res, {
            action: "edit",
            module: "article-category",
            description: `Chỉnh sửa danh mục bài viết: ${req.body.title}`
        });

        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect(`${prefixAdmin}/article-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật thất bại!");
        res.redirect("back");
    }
};

// [PATCH] /admin/article-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        await ArticleCategory.updateOne({ _id: id }, { status: status });

        createLog(req, res, {
            action: "change-status",
            module: "article-category",
            description: `Đổi trạng thái danh mục bài viết sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
        });

        res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        console.log(error);
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
};

// [DELETE] /admin/article-category/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ArticleCategory.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

        if (result.modifiedCount > 0) {
            createLog(req, res, {
                action: "delete",
                module: "article-category",
                description: `Xoá danh mục bài viết (ID: ${id})`
            });

            res.json({ code: 200, message: "Xóa danh mục thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        console.log(error);
        res.json({ code: 400, message: "Xóa danh mục thất bại!" });
    }
};
