// Kế thừa pattern từ routes/admin/auth.route.js

const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/auth.controller");
const validate = require("../../validates/client/auth.validate");

router.get("/register", controller.register);
router.post("/register", validate.registerPost, controller.registerPost);

router.get("/login", controller.login);
router.post("/login", validate.loginPost, controller.loginPost);

router.get("/logout", controller.logout);

module.exports = router;
