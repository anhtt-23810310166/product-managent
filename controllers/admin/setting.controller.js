const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// [GET] /admin/settings
module.exports.general = (req, res) => {
    res.render("admin/pages/setting/index", {
        pageTitle: "Cài đặt chung",
        currentPage: "settings",
        breadcrumbs: [
            { title: "Cài đặt" }
        ]
    });
}
