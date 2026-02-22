const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/chat.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

// Bắt buộc đăng nhập để xem Chat
router.get("/", authMiddleware.requireAuth, controller.index);

module.exports = router;
