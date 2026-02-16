const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/account.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/account.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", upload.single("avatar"), validate.createPost, controller.createPost);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", upload.single("avatar"), validate.editPatch, controller.editPatch);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteAccount);

module.exports = router;
