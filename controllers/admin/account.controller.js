const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const md5 = require("md5");
const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");

// Generate random token
const generateToken = (length = 20) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.$or = [
                { fullName: objectSearch.regex },
                { email: objectSearch.regex }
            ];
        }

        // Filter Status
        const objectFilter = filterStatusHelper(req.query);
        if (objectFilter.status) {
            find.status = objectFilter.status;
        }

        // Sort
        const sortOptions = [
            { value: "fullName-asc", label: "Tên A - Z" },
            { value: "fullName-desc", label: "Tên Z - A" },
            { value: "createdAt-desc", label: "Mới nhất" },
            { value: "createdAt-asc", label: "Cũ nhất" }
        ];
        const objectSort = sortHelper(req.query, sortOptions);

        // Pagination
        const totalItems = await Account.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const accounts = await Account.find(find)
            .select("-password -token")
            .sort(objectSort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Get role names
        const roles = await Role.find({ deleted: false });
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role._id] = role.title;
        });

        res.render("admin/pages/accounts/index", {
            pageTitle: "Danh sách tài khoản",
            currentPage: "accounts",
            accounts: accounts,
            roleMap: roleMap,
            keyword: objectSearch.keyword,
            filterStatus: objectFilter,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    try {
        const roles = await Role.find({ deleted: false });

        res.render("admin/pages/accounts/create", {
            pageTitle: "Thêm tài khoản",
            currentPage: "accounts",
            roles: roles
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    try {
        // Check email unique
        const existEmail = await Account.findOne({
            email: req.body.email,
            deleted: false
        });
        if (existEmail) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }

        req.body.password = md5(req.body.password);
        req.body.token = generateToken();

        if (req.file) {
            req.body.avatar = req.file.path;
        }

        const account = new Account(req.body);
        await account.save();

        req.flash("success", "Tạo tài khoản thành công!");
        res.redirect(`/${res.locals.prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            deleted: false
        }).select("-password -token");

        if (!account) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }

        const roles = await Role.find({ deleted: false });

        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            currentPage: "accounts",
            account: account,
            roles: roles
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        // Check email unique (excluding current)
        const existEmail = await Account.findOne({
            email: req.body.email,
            _id: { $ne: req.params.id },
            deleted: false
        });
        if (existEmail) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }

        // Only update password if provided
        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }

        if (req.file) {
            req.body.avatar = req.file.path;
        }

        await Account.updateOne({ _id: req.params.id }, req.body);

        req.flash("success", "Cập nhật tài khoản thành công!");
        res.redirect("back");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            deleted: false
        }).select("-password -token");

        if (!account) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }

        // Get role name
        let role = null;
        if (account.role_id) {
            role = await Role.findOne({ _id: account.role_id });
        }

        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi tiết tài khoản",
            currentPage: "accounts",
            account: account,
            role: role
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const status = req.params.status;
        const id = req.params.id;

        const result = await Account.updateOne({ _id: id }, { status: status });

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

// [PATCH] /admin/accounts/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        let count = 0;

        switch (type) {
            case "active":
                const resultActive = await Account.updateMany(
                    { _id: { $in: ids } },
                    { status: "active" }
                );
                count = resultActive.modifiedCount;
                break;
            case "inactive":
                const resultInactive = await Account.updateMany(
                    { _id: { $in: ids } },
                    { status: "inactive" }
                );
                count = resultInactive.modifiedCount;
                break;
            case "delete":
                const resultDelete = await Account.updateMany(
                    { _id: { $in: ids } },
                    { deleted: true, deletedAt: new Date() }
                );
                count = resultDelete.modifiedCount;
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

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteAccount = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Account.updateOne(
            { _id: id },
            { deleted: true, deletedAt: new Date() }
        );

        if (result.modifiedCount > 0) {
            res.json({
                code: 200,
                message: "Xoá tài khoản thành công!"
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
