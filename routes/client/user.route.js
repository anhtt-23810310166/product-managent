const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/auth.controller");
const validate = require("../../validates/client/auth.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const upload = require("../../helpers/upload");

router.get("/register", controller.register);
router.post("/register", validate.registerPost, controller.registerPost);

router.get("/login", controller.login);
router.post("/login", validate.loginPost, controller.loginPost);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);
router.post("/password/forgot", validate.forgotPasswordPost, controller.forgotPasswordPost);

router.get("/password/otp", controller.otpPassword);
router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);
router.post("/password/reset", validate.resetPasswordPost, controller.resetPasswordPost);

router.get("/info", authMiddleware.requireAuth, controller.info);
router.post("/info", authMiddleware.requireAuth, upload.single("avatar"), validate.infoPost, controller.infoPost);

router.get("/password/change", authMiddleware.requireAuth, controller.changePassword);
router.post("/password/change", authMiddleware.requireAuth, validate.changePasswordPost, controller.changePasswordPost);

const addressRoutes = require("./address.route");
router.use("/address", addressRoutes);

module.exports = router;
