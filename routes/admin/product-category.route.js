const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/product-category.controller");
const upload = require("../../helpers/upload");
const validate = require("../../validates/admin/product-category.validate");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.get("/create", controller.create);
router.post("/create", upload.single("thumbnail"), validate.createPost, controller.createPost);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", upload.single("thumbnail"), validate.editPatch, controller.editPatch);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteCategory);

module.exports = router;
