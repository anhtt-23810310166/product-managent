const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/account.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/account.validate");
const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.get("/create", auth.requirePermission("accounts_create"), controller.create);
router.post("/create", auth.requirePermission("accounts_create"), upload.single("avatar"), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("accounts_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("accounts_edit"), upload.single("avatar"), validate.editPatch, controller.editPatch);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", auth.requirePermission("accounts_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("accounts_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("accounts_delete"), controller.deleteAccount);

module.exports = router;
