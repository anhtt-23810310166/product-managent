const Order = require("../../models/order.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// Map trạng thái đơn hàng
const STATUS_MAP = {
    pending: { label: "Chờ xác nhận", class: "status-pending" },
    confirmed: { label: "Đã xác nhận", class: "status-confirmed" },
    shipping: { label: "Đang giao", class: "status-shipping" },
    delivered: { label: "Đã giao", class: "status-delivered" },
    cancelled: { label: "Đã hủy", class: "status-cancelled" }
};

// [GET] /admin/orders
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };

        // Filter trạng thái đơn hàng
        const orderStatuses = [
            { name: "Tất cả", status: "", class: "" },
            { name: "Chờ xác nhận", status: "pending", class: "status-pending" },
            { name: "Đã xác nhận", status: "confirmed", class: "status-confirmed" },
            { name: "Đang giao", status: "shipping", class: "status-shipping" },
            { name: "Đã giao", status: "delivered", class: "status-delivered" },
            { name: "Đã hủy", status: "cancelled", class: "status-cancelled" }
        ];

        // Đánh dấu active
        const currentStatus = req.query.status || "";
        orderStatuses.forEach(item => {
            item.active = item.status === currentStatus;
        });

        if (req.query.status) {
            find.status = req.query.status;
        }

        // Search
        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.customerName = objectSearch.regex;
        }

        // Pagination
        const totalItems = await Order.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems);

        // Sort
        const objectSort = sortHelper(req.query);
        const sort = Object.keys(objectSort.sortObject).length > 0
            ? objectSort.sortObject
            : { createdAt: -1 };

        const orders = await Order
            .find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        res.render("admin/pages/orders/index", {
            pageTitle: "Quản lý đơn hàng",
            currentPage: "orders",
            breadcrumbs: [
                { title: "Đơn hàng" },
                { title: "Danh sách" }
            ],
            orders,
            orderStatuses,
            statusMap: STATUS_MAP,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log("Order index error:", error);
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, deleted: false });

        if (!order) {
            req.flash("error", "Đơn hàng không tồn tại!");
            return res.redirect(`${prefixAdmin}/orders`);
        }

        res.render("admin/pages/orders/detail", {
            pageTitle: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            currentPage: "orders",
            breadcrumbs: [
                { title: "Đơn hàng", link: `${prefixAdmin}/orders` },
                { title: "Chi tiết" }
            ],
            order,
            statusMap: STATUS_MAP
        });
    } catch (error) {
        console.log("Order detail error:", error);
        res.redirect(`${prefixAdmin}/orders`);
    }
};

// [PATCH] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            req.flash("error", "Trạng thái không hợp lệ!");
            return res.redirect("back");
        }

        await Order.updateOne({ _id: id }, { status });

        req.flash("success", `Đã cập nhật trạng thái đơn hàng thành "${STATUS_MAP[status].label}"!`);
        res.redirect("back");
    } catch (error) {
        console.log("Change order status error:", error);
        req.flash("error", "Lỗi cập nhật trạng thái!");
        res.redirect("back");
    }
};

// [DELETE] /admin/orders/delete/:id
module.exports.deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        await Order.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

        req.flash("success", "Đã xóa đơn hàng!");
        res.redirect("back");
    } catch (error) {
        console.log("Delete order error:", error);
        req.flash("error", "Lỗi xóa đơn hàng!");
        res.redirect("back");
    }
};
