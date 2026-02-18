const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/product-category.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/product-category.validate");
const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.get("/create", auth.requirePermission("product-category_create"), controller.create);
router.post("/create", auth.requirePermission("product-category_create"), upload.single("thumbnail"), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("product-category_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("product-category_edit"), upload.single("thumbnail"), validate.editPatch, controller.editPatch);
router.patch("/change-status/:status/:id", auth.requirePermission("product-category_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("product-category_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("product-category_delete"), controller.deleteCategory);

module.exports = router;
