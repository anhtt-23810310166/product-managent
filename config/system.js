module.exports = (app) => {
    const PATH_ADMIN = "/admin";

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
            label: "Nhóm quyền",
            name: "roles",
            permissions: [
                { label: "Xem", action: "view" },
                { label: "Thêm mới", action: "create" },
                { label: "Chỉnh sửa", action: "edit" },
                { label: "Xóa", action: "delete" },
                { label: "Phân quyền", action: "permissions" }
            ]
        }
    ];
};
