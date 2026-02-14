const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/product.controller");
const upload = require("../../helpers/upload");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", upload.single("thumbnail"), controller.createPost);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", upload.single("thumbnail"), controller.editPatch);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteProduct);

module.exports = router;