const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createTree = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const createLog = require("../../helpers/activityLog");

// Helper: Recursively get all descendant categories
const getDescendants = async (parentId) => {
    const children = await ProductCategory.find({ parent_id: parentId, deleted: false });
    let descendants = [];
    for (const child of children) {
        descendants.push(child);
        const grandChildren = await getDescendants(child._id);
        descendants = descendants.concat(grandChildren);
    }
    return descendants;
};

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

        // Sort
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
            .sort(sort);

        const tree = createTree(categories);

        res.render("admin/pages/product-category/index", {
            pageTitle: "Danh mục sản phẩm",
            currentPage: "product-category",
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Danh mục" }
            ],
            categories: tree,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/product-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await ProductCategory.findById(id);

        if (!category) {
            req.flash("error", "Không tìm thấy danh mục!");
            return res.redirect(`${prefixAdmin}/product-category`);
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
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Danh mục", link: `${prefixAdmin}/product-category` },
                { title: category.title }
            ],
            category: category,
            parentCategory: parentCategory,
            childCategories: childCategories
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/product-category`);
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
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Danh mục", link: `${prefixAdmin}/product-category` },
                { title: "Thêm danh mục" }
            ],
            categories: tree
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/product-category`);
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

        createLog(req, res, {
            action: "create",
            module: "product-category",
            description: `Thêm danh mục: ${req.body.title}`
        });

        req.flash("success", "Tạo danh mục thành công!");
        res.redirect(`${prefixAdmin}/product-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", `Có lỗi xảy ra: ${error.message}`);
        res.redirect(`${prefixAdmin}/product-category`);
    }
};

// [GET] /admin/product-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await ProductCategory.findById(id);

        if (!category) {
            req.flash("error", "Không tìm thấy danh mục!");
            return res.redirect(`${prefixAdmin}/product-category`);
        }

        const categories = await ProductCategory.find({
            _id: { $ne: id },
            deleted: false
        }).sort({ position: "asc" });
        const tree = createTree(categories);

        res.render("admin/pages/product-category/edit", {
            pageTitle: "Chỉnh sửa danh mục",
            currentPage: "product-category",
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Danh mục", link: `${prefixAdmin}/product-category` },
                { title: "Chỉnh sửa" }
            ],
            category: category,
            categories: tree,
            returnUrl: req.headers.referer || `${prefixAdmin}/product-category`
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/product-category`);
    }
};

// [PATCH] /admin/product-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        const returnUrl = req.body.returnUrl;
        delete req.body.returnUrl;

        if (req.body.position !== undefined && req.body.position !== "") {
            req.body.position = parseInt(req.body.position);
        }

        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        await ProductCategory.updateOne({ _id: id }, req.body);

        createLog(req, res, {
            action: "edit",
            module: "product-category",
            description: `Chỉnh sửa danh mục: ${req.body.title}`
        });

        // If status is updated, cascade to all descendants
        if (req.body.status) {
             const descendants = await getDescendants(id);
             const descendantIds = descendants.map(item => item._id);
             if (descendantIds.length > 0) {
                 await ProductCategory.updateMany(
                     { _id: { $in: descendantIds } },
                     { status: req.body.status }
                 );
             }
        }

        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect(returnUrl || `${prefixAdmin}/product-category`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/product-category`);
    }
};

// [PATCH] /admin/product-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const status = req.params.status;
        const id = req.params.id;

        await ProductCategory.updateOne({ _id: id }, { status: status });

        createLog(req, res, {
            action: "change-status",
            module: "product-category",
            description: `Đổi trạng thái danh mục sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
        });

        // Cascade status update to all descendant categories
        const descendants = await getDescendants(id);
        const descendantIds = descendants.map(item => item._id);
        
        if (descendantIds.length > 0) {
            await ProductCategory.updateMany(
                { _id: { $in: descendantIds } },
                { status: status }
            );
        }

        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            descendantsUpdated: descendantIds.length,
            descendantIds: descendantIds
        });
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
            case "inactive":
                await ProductCategory.updateMany(
                    { _id: { $in: ids } },
                    { status: type }
                );
                
                // Cascade status update to descendants for each selected category
                for (const id of ids) {
                    const descendants = await getDescendants(id);
                    const descendantIds = descendants.map(item => item._id);
                    if (descendantIds.length > 0) {
                        await ProductCategory.updateMany(
                            { _id: { $in: descendantIds } },
                            { status: type }
                        );
                    }
                }
                
                return res.json({
                    code: 200,
                    message: "Cập nhật trạng thái thành công!"
                });
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

        // Find the category to get its parent_id
        const category = await ProductCategory.findById(id);
        if (!category) {
            return res.json({
                code: 400,
                message: "Danh mục không tồn tại!"
            });
        }

        // Re-parent: move children up to the deleted category's parent
        await ProductCategory.updateMany(
            { parent_id: id },
            { parent_id: category.parent_id }
        );

        // Soft delete the category
        await ProductCategory.updateOne({ _id: id }, {
            deleted: true,
            deletedAt: new Date()
        });

        createLog(req, res, {
            action: "delete",
            module: "product-category",
            description: `Xoá danh mục (ID: ${id})`
        });

        res.json({
            code: 200,
            message: "Xóa danh mục thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Có lỗi xảy ra!"
        });
    }
};
