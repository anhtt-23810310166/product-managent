const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/profile.controller");
const upload = require("../../helpers/upload");

router.get("/", controller.index);

router.patch(
    "/edit",
    upload.single("avatar"),
    controller.editPatch
);

module.exports = router;
