const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/product.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/product.validate");
const auth = require("../../middlewares/admin/auth.middleware");
const whitelist = require("../../middlewares/whitelist.middleware");

const productFields = ["title", "product_category_id", "brand_id", "description", "price", "discountPercentage", "stock", "status", "position", "featured", "thumbnail"];

router.get("/", controller.index);
router.get("/create", auth.requirePermission("products_create"), controller.create);
router.post("/create", auth.requirePermission("products_create"), upload.single("thumbnail"), whitelist(productFields), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("products_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("products_edit"), upload.single("thumbnail"), whitelist([...productFields, "returnUrl"]), validate.editPatch, controller.editPatch);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", auth.requirePermission("products_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("products_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("products_delete"), controller.deleteProduct);

module.exports = router;
