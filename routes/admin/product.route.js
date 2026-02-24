const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/product.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/product.validate");
const auth = require("../../middlewares/admin/auth.middleware");
const whitelist = require("../../middlewares/whitelist.middleware");

const productFields = ["title", "product_category_id", "brand_id", "description", "price", "discountPercentage", "stock", "status", "position", "featured", "thumbnail", "images", "deletedImages"];
const rawUpload = upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "images", maxCount: 8 }]);

// Wrapper to catch multer/Cloudinary errors gracefully
const uploadFields = (req, res, next) => {
    rawUpload(req, res, function (err) {
        if (err) {
            console.error("MULTER UPLOAD ERROR:", err);
            // Continue without uploaded files rather than crashing
            return next();
        }
        next();
    });
};

router.get("/", controller.index);
router.get("/create", auth.requirePermission("products_create"), controller.create);
router.post("/create", auth.requirePermission("products_create"), uploadFields, whitelist(productFields), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("products_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("products_edit"), uploadFields, whitelist([...productFields, "returnUrl"]), validate.editPatch, controller.editPatch);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", auth.requirePermission("products_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("products_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("products_delete"), controller.deleteProduct);

module.exports = router;
