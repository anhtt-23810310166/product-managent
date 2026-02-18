const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/role.controller");
const validate = require("../../validates/admin/role.validate");
const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.get("/create", auth.requirePermission("roles_create"), controller.create);
router.post("/create", auth.requirePermission("roles_create"), validate.createPost, controller.createPost);

router.get("/permissions", auth.requirePermission("roles_permissions"), controller.permissions);
router.patch("/permissions", auth.requirePermission("roles_permissions"), validate.permissionsPatch, controller.permissionsPatch);

router.get("/detail/:id", controller.detail);
router.get("/edit/:id", auth.requirePermission("roles_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("roles_edit"), validate.editPatch, controller.editPatch);
router.delete("/delete/:id", auth.requirePermission("roles_delete"), controller.delete);

module.exports = router;
