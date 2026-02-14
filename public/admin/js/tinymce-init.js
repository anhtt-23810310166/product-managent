// TinyMCE initialization
if (typeof tinymce !== "undefined") {
    tinymce.init({
        selector: "textarea[name='description']",
        base_url: "/admin/libs/tinymce",
        suffix: ".min",
        height: 300,
        menubar: false,
        plugins: "lists link image table code fullscreen preview",
        toolbar:
            "undo redo | styles | bold italic underline | bullist numlist | link image table | code fullscreen",
        content_style:
            "body { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; }",
        branding: false,
        promotion: false,
        statusbar: true,
        resize: true,
        placeholder: "Nhập mô tả sản phẩm...",
    });
}
