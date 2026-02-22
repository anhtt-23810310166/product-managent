const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/chat.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

// Route trả về JSON cấu trúc Chat History để Widget JS build HTML
router.get("/history", authMiddleware.requireAuth, controller.history);

module.exports = router;
