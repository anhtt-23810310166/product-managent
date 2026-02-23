const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/address.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

// Require Login cho tất cả tính năng Địa Chỉ
router.use(authMiddleware.requireAuth);

router.get("/", controller.index);

router.get("/create", controller.create);
router.post("/create", controller.createPost);

router.get("/edit/:addressId", controller.edit);
router.post("/edit/:addressId", controller.editPost);

router.post("/set-default/:addressId", controller.setDefault);
router.post("/delete/:addressId", controller.delete);

module.exports = router;
