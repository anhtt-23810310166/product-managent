const User = require("../../models/user.model");
const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// [GET] /admin/users
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.$or = [
                { fullName: objectSearch.regex },
                { email: objectSearch.regex },
                { phone: objectSearch.regex }
            ];
        }

        // Filter Status
        const objectFilter = filterStatusHelper(req.query);
        if (req.query.status) {
            find.status = req.query.status;
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
        const totalItems = await User.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        const users = await User.find(find)
            .select("-password -token -otpPassword -otpPasswordTimeExpire")
            .sort(objectSort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        res.render("admin/pages/users/index", {
            pageTitle: "Danh sách khách hàng",
            currentPage: "users",
            breadcrumbs: [
                { title: "Khách hàng" }
            ],
            users: users,
            keyword: objectSearch.keyword,
            filterStatus: objectFilter,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log("User list error:", error);
        res.redirect("back");
    }
};

// [GET] /admin/users/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, deleted: false })
            .select("-password -token -otpPassword -otpPasswordTimeExpire");

        if (!user) {
            req.flash("error", "Không tìm thấy khách hàng!");
            return res.redirect(`${prefixAdmin}/users`);
        }

        res.render("admin/pages/users/detail", {
            pageTitle: `Chi tiết: ${user.fullName}`,
            currentPage: "users",
            breadcrumbs: [
                { title: "Khách hàng", link: `${prefixAdmin}/users` },
                { title: user.fullName }
            ],
            user: user
        });
    } catch (error) {
        console.log("User detail error:", error);
        res.redirect("back");
    }
};

// [PATCH] /admin/users/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const validStatuses = ["active", "inactive"];

        if (!validStatuses.includes(status)) {
            return res.json({ code: 400, message: "Trạng thái không hợp lệ!" });
        }

        await User.updateOne({ _id: id }, { status });

        const statusLabels = { active: "Hoạt động", inactive: "Khóa" };

        res.json({
            code: 200,
            message: `Đã cập nhật trạng thái thành "${statusLabels[status]}"!`,
            status: status
        });
    } catch (error) {
        console.log("Change user status error:", error);
        res.json({ code: 500, message: "Lỗi cập nhật trạng thái!" });
    }
};

// [DELETE] /admin/users/delete/:id
module.exports.deleteUser = async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, { deleted: true, deletedAt: new Date() });

        req.flash("success", "Đã xóa khách hàng!");
        res.redirect("back");
    } catch (error) {
        console.log("Delete user error:", error);
        req.flash("error", "Lỗi xóa khách hàng!");
        res.redirect("back");
    }
};
