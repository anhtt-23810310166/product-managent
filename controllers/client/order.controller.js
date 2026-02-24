const Order = require("../../models/order.model");

// [GET] /orders
module.exports.index = async (req, res) => {
    try {
        const userId = res.locals.clientUser ? res.locals.clientUser.id : null;
        if (!userId) {
            req.flash("error", "Bạn cần đăng nhập để xem lịch sử đơn hàng!");
            return res.redirect("/user/login");
        }

        const find = {
            userId: userId,
            deleted: false
        };

        // Status filter from query
        const filterStatus = req.query.status || '';
        if (filterStatus && ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].includes(filterStatus)) {
            find.status = filterStatus;
        }

        const orders = await Order.find(find).sort({ createdAt: -1 });

        // Map status labels
        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy"
        };

        res.render("client/pages/orders/index.pug", {
            title: "Đơn hàng của tôi",
            orders: orders,
            statusLabels: statusLabels,
            filterStatus: filterStatus
        });
    } catch (error) {
        console.error("Order history error:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/");
    }
};

// [GET] /orders/:id
module.exports.detail = async (req, res) => {
    try {
        const userId = res.locals.clientUser ? res.locals.clientUser.id : null;
        if (!userId) {
            req.flash("error", "Bạn cần đăng nhập!");
            return res.redirect("/user/login");
        }

        const order = await Order.findOne({
            _id: req.params.id,
            userId: userId,
            deleted: false
        });

        if (!order) {
            req.flash("error", "Đơn hàng không tồn tại!");
            return res.redirect("/orders");
        }

        const statusLabels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy"
        };

        const statusColors = {
            pending: "warning",
            confirmed: "info",
            shipping: "primary",
            delivered: "success",
            cancelled: "danger"
        };

        res.render("client/pages/orders/detail.pug", {
            title: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            order: order,
            statusLabels: statusLabels,
            statusColors: statusColors
        });
    } catch (error) {
        console.error("Order detail error:", error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/orders");
    }
};
