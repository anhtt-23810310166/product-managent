const Role = require("../../models/role.model");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const sortHelper = require("../../helpers/sort");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.title = objectSearch.regex;
        }

        // Sort
        const sortOptions = [
            { value: "title-asc", label: "Tiêu đề A - Z" },
            { value: "title-desc", label: "Tiêu đề Z - A" },
            { value: "createdAt-desc", label: "Mới nhất" },
            { value: "createdAt-asc", label: "Cũ nhất" }
        ];
        const objectSort = sortHelper(req.query, sortOptions);

        // Pagination
        const totalItems = await Role.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const roles = await Role.find(find)
            .sort(objectSort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        res.render("admin/pages/roles/index", {
            pageTitle: "Danh sách nhóm quyền",
            currentPage: "roles",
            roles: roles,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [GET] /admin/roles/create
module.exports.create = (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Thêm nhóm quyền",
        currentPage: "roles",
    });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        req.flash("success", "Thêm nhóm quyền thành công!");
        res.redirect(`${res.app.locals.prefixAdmin}/roles`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Thêm nhóm quyền thất bại!");
        res.redirect("back");
    }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, deleted: false });
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại!");
            return res.redirect(`${res.app.locals.prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            currentPage: "roles",
            role: role,
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        await Role.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật nhóm quyền thành công!");
        res.redirect(`${res.app.locals.prefixAdmin}/roles`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật nhóm quyền thất bại!");
        res.redirect("back");
    }
};

// [DELETE] /admin/roles/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const result = await Role.updateOne({ _id: req.params.id }, { deleted: true, deletedAt: new Date() });

        if (result.modifiedCount > 0) {
            res.json({
                code: 200,
                message: "Xóa nhóm quyền thành công!"
            });
        } else {
            res.json({
                code: 200,
                message: "Không có thay đổi nào!",
                noChange: true
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            code: 400,
            message: "Xóa nhóm quyền thất bại!"
        });
    }
};

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, deleted: false });
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại!");
            return res.redirect(`${res.app.locals.prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/detail", {
            pageTitle: "Chi tiết nhóm quyền",
            currentPage: "roles",
            role: role,
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    try {
        const roles = await Role.find({ deleted: false });

        res.render("admin/pages/roles/permissions", {
            pageTitle: "Phân quyền",
            currentPage: "settings",
            roles: roles
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    try {
        const permissions = JSON.parse(req.body.permissions);

        for (const item of permissions) {
            await Role.updateOne(
                { _id: item.id },
                { permissions: item.permissions }
            );
        }

        req.flash("success", "Cập nhật phân quyền thành công!");
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật phân quyền thất bại!");
    }

    res.redirect("back");
};
