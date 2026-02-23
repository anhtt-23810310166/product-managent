const Brand = require("../../models/brand.model");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const sortHelper = require("../../helpers/sort");
const paginationHelper = require("../../helpers/pagination");
const createLog = require("../../helpers/activityLog");

// [GET] /admin/brands
module.exports.index = async (req, res) => {
    try {
        const filterStatus = filterStatusHelper(req.query);
        const find = { deleted: false };

        if (req.query.status) {
            find.status = req.query.status;
        }

        const objectSearch = searchHelper(req.query);
        if (objectSearch.regex) {
            find.name = objectSearch.regex;
        }

        const totalItems = await Brand.countDocuments(find);
        const objectPagination = paginationHelper(req.query, totalItems);

        const sortOptions = [
            { value: "position-asc", label: "Vị trí tăng dần" },
            { value: "position-desc", label: "Vị trí giảm dần" },
            { value: "name-asc", label: "Tên A - Z" },
            { value: "name-desc", label: "Tên Z - A" }
        ];
        const objectSort = sortHelper(req.query, sortOptions);
        const sort = Object.keys(objectSort.sortObject).length > 0 ? objectSort.sortObject : { position: 1 };

        const brands = await Brand
            .find(find)
            .sort(sort)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        res.render("admin/pages/brands/index", {
            pageTitle: "Thương hiệu sản phẩm",
            currentPage: "brands",
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Thương hiệu" }
            ],
            brands: brands,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
};

// [GET] /admin/brands/create
module.exports.create = async (req, res) => {
    try {
        res.render("admin/pages/brands/create", {
            pageTitle: "Thêm thương hiệu",
            currentPage: "brands",
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Thương hiệu", link: `${prefixAdmin}/brands` },
                { title: "Thêm thương hiệu" }
            ]
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/brands`);
    }
};

// [POST] /admin/brands/create
module.exports.createPost = async (req, res) => {
    try {
        if (req.body.position === "" || req.body.position === undefined) {
            const count = await Brand.countDocuments();
            req.body.position = count + 1;
        } else {
            req.body.position = parseInt(req.body.position);
        }

        if (req.file) {
            req.body.logo = req.file.path;
        }

        await Brand.create(req.body);

        createLog(req, res, {
            action: "create",
            module: "brands",
            description: `Thêm thương hiệu: ${req.body.name}`
        });

        req.flash("success", "Tạo thương hiệu thành công!");
        res.redirect(`${prefixAdmin}/brands`);
    } catch (error) {
        console.log(error);
        req.flash("error", `Có lỗi xảy ra: ${error.message}`);
        res.redirect(`${prefixAdmin}/brands`);
    }
};

// [GET] /admin/brands/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const brand = await Brand.findOne({ _id: req.params.id, deleted: false });
        if (!brand) {
            req.flash("error", "Không tìm thấy thương hiệu!");
            return res.redirect(`${prefixAdmin}/brands`);
        }

        res.render("admin/pages/brands/edit", {
            pageTitle: "Chỉnh sửa thương hiệu",
            currentPage: "brands",
            breadcrumbs: [
                { title: "Sản phẩm" },
                { title: "Thương hiệu", link: `${prefixAdmin}/brands` },
                { title: "Chỉnh sửa" }
            ],
            brand: brand,
            returnUrl: req.headers.referer || `${prefixAdmin}/brands`
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/brands`);
    }
};

// [PATCH] /admin/brands/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const returnUrl = req.body.returnUrl;
        delete req.body.returnUrl;

        if (req.body.position !== undefined && req.body.position !== "") {
            req.body.position = parseInt(req.body.position);
        }

        if (req.file) {
            req.body.logo = req.file.path;
        }

        await Brand.updateOne({ _id: req.params.id }, req.body);

        createLog(req, res, {
            action: "edit",
            module: "brands",
            description: `Chỉnh sửa thương hiệu: ${req.body.name}`
        });

        req.flash("success", "Cập nhật thương hiệu thành công!");
        res.redirect(returnUrl || `${prefixAdmin}/brands`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/brands`);
    }
};

// [PATCH] /admin/brands/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { status, id } = req.params;
        await Brand.updateOne({ _id: id }, { status: status });

        createLog(req, res, {
            action: "change-status",
            module: "brands",
            description: `Đổi trạng thái thương hiệu sang ${status === "active" ? "hoạt động" : "dừng hoạt động"}`
        });

        res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Cập nhật thất bại!" });
    }
};

// [PATCH] /admin/brands/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, type } = req.body;
        let count = 0;

        switch (type) {
            case "active":
            case "inactive":
                await Brand.updateMany({ _id: { $in: ids } }, { status: type });
                return res.json({ code: 200, message: "Cập nhật trạng thái thành công!" });
            case "delete":
                const resultDelete = await Brand.updateMany(
                    { _id: { $in: ids } },
                    { deleted: true, deletedAt: new Date() }
                );
                count = resultDelete.modifiedCount;
                break;
            case "change-position":
                for (const item of ids) {
                    const resultPos = await Brand.updateOne(
                        { _id: item.id },
                        { position: parseInt(item.position) }
                    );
                    count += resultPos.modifiedCount;
                }
                break;
            default:
                return res.json({ code: 400, message: "Hành động không hợp lệ!" });
        }

        res.json({
            code: 200,
            message: count > 0 ? "Cập nhật thành công!" : "Không có thay đổi nào!",
            count: count
        });
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};

// [DELETE] /admin/brands/delete/:id
module.exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Brand.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

        if (result.modifiedCount > 0) {
            createLog(req, res, {
                action: "delete",
                module: "brands",
                description: `Xoá thương hiệu (ID: ${id})`
            });
            res.json({ code: 200, message: "Xoá thương hiệu thành công!" });
        } else {
            res.json({ code: 200, message: "Không có thay đổi nào!", noChange: true });
        }
    } catch (error) {
        res.json({ code: 400, message: "Có lỗi xảy ra!" });
    }
};
