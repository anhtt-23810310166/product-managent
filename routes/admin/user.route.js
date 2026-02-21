const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/user.controller");
const upload = require("../../helpers/upload");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", upload.single("avatar"), controller.editPatch);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteUser);

module.exports = router;
