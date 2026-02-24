const ActivityLog = require("../../models/activity-log.model");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const dayjs = require("dayjs");
const prefixAdmin = systemConfig.prefixAdmin;

// [GET] /admin/activity-logs
module.exports.index = async (req, res) => {
    try {
        const find = {};

        // Filter theo module
        if (req.query.module) {
            find.module = req.query.module;
        }

        // Filter theo action
        if (req.query.action) {
            find.action = req.query.action;
        }

        // Search theo tên nhân viên
        if (req.query.keyword && req.query.keyword.trim() !== "") {
            const keyword = req.query.keyword.trim();
            const regex = new RegExp(keyword, "i");
            find.accountFullName = regex;
        }

        // Pagination
        const totalItems = await ActivityLog.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems, 20);

        // Query với .lean() cho performance
        const logs = await ActivityLog.find(find)
            .sort({ createdAt: -1 })
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems)
            .lean();

        // Format thời gian bằng dayjs
        logs.forEach(log => {
            log.createdAtFormatted = dayjs(log.createdAt).format("DD/MM/YYYY HH:mm:ss");
        });

        const moduleLabels = {
            "products": "Sản phẩm",
            "product-category": "Danh mục sản phẩm",
            "brands": "Thương hiệu",
            "articles": "Bài viết",
            "article-category": "Danh mục bài viết",
            "accounts": "Tài khoản",
            "roles": "Nhóm quyền",
            "auth": "Xác thực"
        };

        // Action labels
        const actionLabels = {
            "create": "Thêm mới",
            "edit": "Chỉnh sửa",
            "delete": "Xoá",
            "change-status": "Đổi trạng thái",
            "change-multi": "Thao tác hàng loạt",
            "login": "Đăng nhập",
            "logout": "Đăng xuất",
            "permissions": "Phân quyền"
        };

        res.render("admin/pages/activity-logs/index", {
            pageTitle: "Nhật ký hoạt động",
            currentPage: "activity-logs",
            breadcrumbs: [
                { title: "Cài đặt", link: `${prefixAdmin}/settings` },
                { title: "Nhật ký hoạt động" }
            ],
            logs: logs,
            pagination: objectPagination,
            keyword: req.query.keyword || "",
            currentModule: req.query.module || "",
            currentAction: req.query.action || "",
            moduleLabels: moduleLabels,
            actionLabels: actionLabels
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};
