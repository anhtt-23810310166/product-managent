const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/article-category.controller");
const upload = require("../../helpers/upload");
const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.get("/create", auth.requirePermission("article-category_create"), controller.create);
router.post("/create", auth.requirePermission("article-category_create"), upload.single("thumbnail"), controller.createPost);
router.get("/edit/:id", auth.requirePermission("article-category_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("article-category_edit"), upload.single("thumbnail"), controller.editPatch);
router.patch("/change-status/:status/:id", auth.requirePermission("article-category_change-status"), controller.changeStatus);
router.delete("/delete/:id", auth.requirePermission("article-category_delete"), controller.delete);

module.exports = router;
