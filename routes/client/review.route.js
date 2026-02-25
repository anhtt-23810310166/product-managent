const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/review.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.post("/:productId", authMiddleware.requireAuth, controller.createReview);

module.exports = router;
