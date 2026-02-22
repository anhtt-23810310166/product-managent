const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/chat.controller");

router.get("/", controller.index);
router.get("/:roomChatId", controller.detail);

module.exports = router;
