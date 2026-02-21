const PATH_ADMIN = "/admin";

const systemConfig = (app) => {
    app.locals.prefixAdmin = PATH_ADMIN;

    app.locals.permissions = [
        {
            label: "Sản phẩm",
            name: "products",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Đổi trạng thái", action: "change-status" }
            ]
        },
        {
            label: "Danh mục sản phẩm",
            name: "product-category",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Đổi trạng thái", action: "change-status" }
            ]
        },
        {
            label: "Bài viết",
            name: "articles",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Đổi trạng thái", action: "change-status" }
            ]
        },
        {
            label: "Danh mục bài viết",
            name: "article-category",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Đổi trạng thái", action: "change-status" }
            ]
        },
        {
            label: "Nhóm quyền",
            name: "roles",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Phân quyền", action: "permissions" }
            ]
        },
        {
            label: "Tài khoản",
            name: "accounts",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Đổi trạng thái", action: "change-status" }
            ]
        },
        {
            label: "Đơn hàng",
            name: "orders",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Đổi trạng thái", action: "change-status" },
                { label: "Xóa", action: "delete" }
            ]
        },
        {
            label: "Khách hàng",
            name: "users",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Đổi trạng thái", action: "change-status" },
                { label: "Xóa", action: "delete" }
            ]
        }
    ];
};

systemConfig.prefixAdmin = PATH_ADMIN;
module.exports = systemConfig;
