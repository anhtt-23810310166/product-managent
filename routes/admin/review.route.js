const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/review.controller");

router.get("/", controller.index);
router.delete("/delete/:id", controller.deleteReview);

module.exports = router;
