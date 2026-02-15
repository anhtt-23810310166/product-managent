const ProductCategory = require("../../models/product-category.model");
const createTree = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/product-category
module.exports.index = async (req, res) => {
    try {
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

        // Pagination
        const totalItems = await ProductCategory.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems);

        // Sort (danh mục không có giá)
        const categorySortOptions = [
            { value: "position-desc", label: "Vị trí giảm dần" },
            { value: "position-asc", label: "Vị trí tăng dần" },
            { value: "title-asc", label: "Tiêu đề A - Z" },
            { value: "title-desc", label: "Tiêu đề Z - A" }
        ];
        const objectSort = sortHelper(req.query, categorySortOptions);
        const sort = Object.keys(objectSort.sortObject).length > 0 ? objectSort.sortObject : { position: 1 };

        const categories = await ProductCategory
            .find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        const tree = createTree(categories);

        res.render("admin/pages/product-category/index", {
            pageTitle: "Danh mục sản phẩm",
            currentPage: "product-category",
            categories: tree,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/product-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await ProductCategory.findById(id);

        if (!category) {
            req.flash("error", "Không tìm thấy danh mục!");
            return res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
        }

        // Get parent category
        let parentCategory = null;
        if (category.parent_id) {
            parentCategory = await ProductCategory.findById(category.parent_id);
        }

        // Get child categories
        const childCategories = await ProductCategory.find({
            parent_id: id,
            deleted: false
        }).sort({ position: 1 });

        res.render("admin/pages/product-category/detail", {
            pageTitle: `Chi tiết: ${category.title}`,
            currentPage: "product-category",
            category: category,
            parentCategory: parentCategory,
            childCategories: childCategories
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    }
};

// [GET] /admin/product-category/create
module.exports.create = async (req, res) => {
    try {
        const categories = await ProductCategory.find({ deleted: false }).sort({ position: "asc" });
        const tree = createTree(categories);

        res.render("admin/pages/product-category/create", {
            pageTitle: "Thêm danh mục",
            currentPage: "product-category",
            categories: tree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    }
};

// [POST] /admin/product-category/create
module.exports.createPost = async (req, res) => {
    try {
        if (req.body.position === "" || req.body.position === undefined) {
            const count = await ProductCategory.countDocuments();
            req.body.position = count + 1;
        } else {
            req.body.position = parseInt(req.body.position);
        }

        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        await ProductCategory.create(req.body);
        req.flash("success", "Tạo danh mục thành công!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    }
};

// [GET] /admin/product-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await ProductCategory.findById(id);

        if (!category) {
            req.flash("error", "Không tìm thấy danh mục!");
            return res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
        }

        const categories = await ProductCategory.find({
            _id: { $ne: id },
            deleted: false
        }).sort({ position: "asc" });
        const tree = createTree(categories);

        res.render("admin/pages/product-category/edit", {
            pageTitle: "Chỉnh sửa danh mục",
            currentPage: "product-category",
            category: category,
            categories: tree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    }
};

// [PATCH] /admin/product-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.body.position !== undefined && req.body.position !== "") {
            req.body.position = parseInt(req.body.position);
        }

        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        await ProductCategory.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${res.app.locals.prefixAdmin}/product-category`);
    }
};

// [PATCH] /admin/product-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        const result = await ProductCategory.updateOne({ _id: id }, { status: status });

        if (result.modifiedCount > 0) {
            res.json({
                code: 200,
                message: "Cập nhật trạng thái thành công!"
            });
        } else {
            res.json({
                code: 200,
                message: "Không có thay đổi nào!",
                noChange: true
            });
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật thất bại!"
        });
    }
};

// [PATCH] /admin/product-category/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        let count = 0;

        switch (type) {
            case "active":
                const resultActive = await ProductCategory.updateMany(
                    { _id: { $in: ids } },
                    { status: "active" }
                );
                count = resultActive.modifiedCount;
                break;
            case "inactive":
                const resultInactive = await ProductCategory.updateMany(
                    { _id: { $in: ids } },
                    { status: "inactive" }
                );
                count = resultInactive.modifiedCount;
                break;
            case "delete":
                const resultDelete = await ProductCategory.updateMany(
                    { _id: { $in: ids } },
                    { deleted: true, deletedAt: new Date() }
                );
                count = resultDelete.modifiedCount;
                break;
            case "change-position":
                for (const item of ids) {
                    const resultPos = await ProductCategory.updateOne(
                        { _id: item.id },
                        { position: parseInt(item.position) }
                    );
                    count += resultPos.modifiedCount;
                }
                break;
            default:
                return res.json({
                    code: 400,
                    message: "Hành động không hợp lệ!"
                });
        }

        res.json({
            code: 200,
            message: count > 0 ? "Cập nhật thành công!" : "Không có thay đổi nào!",
            count: count
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
};

// [DELETE] /admin/product-category/delete/:id
module.exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ProductCategory.updateOne({ _id: id }, {
            deleted: true,
            deletedAt: new Date()
        });

        if (result.modifiedCount > 0) {
            res.json({
                code: 200,
                message: "Xóa danh mục thành công!"
            });
        } else {
            res.json({
                code: 200,
                message: "Không có thay đổi nào!",
                noChange: true
            });
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
};
