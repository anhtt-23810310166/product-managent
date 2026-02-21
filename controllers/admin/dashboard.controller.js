const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Order = require("../../models/order.model");
const Account = require("../../models/account.model");
const Article = require("../../models/article.model");
const User = require("../../models/user.model");

// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
    try {
        // Thống kê tổng quan
        const [
            totalProducts,
            totalCategories,
            totalOrders,
            totalAccounts,
            totalArticles,
            totalUsers,
            pendingOrders,
            confirmedOrders,
            shippingOrders,
            deliveredOrders,
            cancelledOrders
        ] = await Promise.all([
            Product.countDocuments({ deleted: false }),
            ProductCategory.countDocuments({ deleted: false }),
            Order.countDocuments({ deleted: false }),
            Account.countDocuments({ deleted: false }),
            Article.countDocuments({ deleted: false }),
            User.countDocuments({ deleted: false }),
            Order.countDocuments({ deleted: false, status: "pending" }),
            Order.countDocuments({ deleted: false, status: "confirmed" }),
            Order.countDocuments({ deleted: false, status: "shipping" }),
            Order.countDocuments({ deleted: false, status: "delivered" }),
            Order.countDocuments({ deleted: false, status: "cancelled" })
        ]);

        // Tổng doanh thu (đơn đã giao)
        const revenueResult = await Order.aggregate([
            { $match: { deleted: false, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Đơn hàng mới nhất (5 đơn)
        const recentOrders = await Order
            .find({ deleted: false })
            .sort({ createdAt: -1 })
            .limit(5);

        // Sản phẩm mới nhất (5 sp)
        const recentProducts = await Product
            .find({ deleted: false })
            .sort({ createdAt: -1 })
            .limit(5);

        res.render("admin/pages/dashboard/index", {
            pageTitle: "Dashboard",
            currentPage: "dashboard",
            stats: {
                totalProducts,
                totalCategories,
                totalOrders,
                totalAccounts,
                totalArticles,
                totalUsers,
                totalRevenue,
                pendingOrders,
                confirmedOrders,
                shippingOrders,
                deliveredOrders,
                cancelledOrders
            },
            recentOrders,
            recentProducts
        });
    } catch (error) {
        console.log("Dashboard error:", error);
        res.render("admin/pages/dashboard/index", {
            pageTitle: "Dashboard",
            currentPage: "dashboard",
            stats: {},
            recentOrders: [],
            recentProducts: []
        });
    }
}