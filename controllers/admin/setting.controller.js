// [GET] /admin/settings
module.exports.general = (req, res) => {
    res.render("admin/pages/setting/index", {
        pageTitle: "Cài đặt chung",
        currentPage: "settings",
    });
}
