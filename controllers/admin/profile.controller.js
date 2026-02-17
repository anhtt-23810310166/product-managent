const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const md5 = require("md5");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const createLog = require("../../helpers/activityLog");

// [GET] /admin/profile
module.exports.index = async (req, res) => {
    try {
        const account = await Account.findById(res.locals.user._id);

        if (!account) {
            req.flash("error", "Không tìm thấy tài khoản!");
            return res.redirect(`${prefixAdmin}/dashboard`);
        }

        // Lấy tên nhóm quyền
        let roleName = "";
        if (account.role_id) {
            const role = await Role.findById(account.role_id);
            roleName = role ? role.title : "";
        }

        res.render("admin/pages/profile/index", {
            pageTitle: "Thông tin cá nhân",
            currentPage: "profile",
            breadcrumbs: [
                { title: "Thông tin cá nhân" }
            ],
            account: account,
            roleName: roleName
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [PATCH] /admin/profile/edit
module.exports.editPatch = async (req, res) => {
    try {
        // Chỉ cho phép cập nhật các trường cá nhân
        const updateData = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone
        };

        // Kiểm tra email trùng
        if (req.body.email) {
            const existAccount = await Account.findOne({
                email: req.body.email,
                _id: { $ne: res.locals.user._id },
                deleted: false
            });
            if (existAccount) {
                req.flash("error", "Email đã tồn tại!");
                return res.redirect("back");
            }
        }

        // Đổi mật khẩu nếu có nhập
        if (req.body.password && req.body.password.trim() !== "") {
            updateData.password = md5(req.body.password);
        }

        // Cập nhật avatar nếu có upload
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        await Account.updateOne({ _id: res.locals.user._id }, updateData);

        createLog(req, res, {
            action: "edit",
            module: "accounts",
            description: `Cập nhật thông tin cá nhân`
        });

        req.flash("success", "Cập nhật thông tin thành công!");
        res.redirect(`${prefixAdmin}/profile`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật thất bại!");
        res.redirect("back");
    }
};
