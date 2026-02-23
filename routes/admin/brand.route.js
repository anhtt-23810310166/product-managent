const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/brand.controller");
const upload = require("../../helpers/upload");
const auth = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/brand.validate");
const whitelist = require("../../middlewares/whitelist.middleware");

const brandFields = ["name", "description", "status", "position", "logo"];

router.get("/", controller.index);
router.get("/create", auth.requirePermission("brands_create"), controller.create);
router.post("/create", auth.requirePermission("brands_create"), upload.single("logo"), whitelist(brandFields), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("brands_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("brands_edit"), upload.single("logo"), whitelist([...brandFields, "returnUrl"]), validate.editPatch, controller.editPatch);
router.patch("/change-status/:status/:id", auth.requirePermission("brands_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("brands_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("brands_delete"), controller.deleteBrand);

module.exports = router;
