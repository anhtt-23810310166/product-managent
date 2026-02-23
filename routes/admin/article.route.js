const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/article.controller");
const upload = require("../../helpers/upload");
const auth = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/article.validate");
const whitelist = require("../../middlewares/whitelist.middleware");

const articleFields = ["title", "description", "article_category_id", "status", "position", "thumbnail"];

router.get("/", controller.index);
router.get("/create", auth.requirePermission("articles_create"), controller.create);
router.post("/create", auth.requirePermission("articles_create"), upload.single("thumbnail"), whitelist(articleFields), validate.createPost, controller.createPost);
router.get("/edit/:id", auth.requirePermission("articles_edit"), controller.edit);
router.patch("/edit/:id", auth.requirePermission("articles_edit"), upload.single("thumbnail"), whitelist([...articleFields, "returnUrl"]), validate.editPatch, controller.editPatch);
router.patch("/change-status/:status/:id", auth.requirePermission("articles_change-status"), controller.changeStatus);
router.patch("/change-multi", auth.requirePermission("articles_edit"), controller.changeMulti);
router.delete("/delete/:id", auth.requirePermission("articles_delete"), controller.deleteArticle);

module.exports = router;
