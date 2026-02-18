const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/order.controller");
const auth = require("../../middlewares/admin/auth.middleware");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.patch("/change-status/:status/:id", auth.requirePermission("orders_change-status"), controller.changeStatus);
router.delete("/delete/:id", auth.requirePermission("orders_delete"), controller.deleteOrder);

module.exports = router;
