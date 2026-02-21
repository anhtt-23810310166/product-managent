const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/user.controller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteUser);

module.exports = router;
