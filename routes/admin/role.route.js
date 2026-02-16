const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/role.controller");
const validate = require("../../validates/admin/role.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", validate.createPost, controller.createPost);

router.get("/permissions", controller.permissions);
router.patch("/permissions", validate.permissionsPatch, controller.permissionsPatch);

router.get("/detail/:id", controller.detail);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", validate.editPatch, controller.editPatch);
router.delete("/delete/:id", controller.delete);

module.exports = router;
