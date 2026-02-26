const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

// [POST] /user/register
const registerSchema = Joi.object({
    fullName: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập họ tên!",
        "any.required": "Vui lòng nhập họ tên!"
    }),
    email: Joi.string().trim().email().required().messages({
        "string.empty": "Vui lòng nhập email!",
        "any.required": "Vui lòng nhập email!",
        "string.email": "Email không đúng định dạng!"
    }),
    password: Joi.string().trim().min(6).required().messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "any.required": "Vui lòng nhập mật khẩu!",
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự!"
    }),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Xác nhận mật khẩu không khớp!",
        "any.required": "Vui lòng xác nhận mật khẩu!"
    })
});

// [POST] /user/login
const loginSchema = Joi.object({
    email: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập email!",
        "any.required": "Vui lòng nhập email!"
    }),
    password: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "any.required": "Vui lòng nhập mật khẩu!"
    })
});

// [POST] /user/password/forgot
const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập email!",
        "any.required": "Vui lòng nhập email!"
    })
});

// [POST] /user/password/reset
const resetPasswordSchema = Joi.object({
    password: Joi.string().trim().min(6).required().messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "any.required": "Vui lòng nhập mật khẩu!",
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự!"
    }),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Xác nhận mật khẩu không khớp!",
        "any.required": "Vui lòng xác nhận mật khẩu!"
    })
});

// [POST] /user/info
const infoSchema = Joi.object({
    fullName: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập họ tên!",
        "any.required": "Vui lòng nhập họ tên!"
    })
});

// [POST] /user/password/change
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().trim().required().messages({
        "string.empty": "Vui lòng nhập mật khẩu hiện tại!",
        "any.required": "Vui lòng nhập mật khẩu hiện tại!"
    }),
    newPassword: Joi.string().trim().min(6).required().messages({
        "string.empty": "Vui lòng nhập mật khẩu mới!",
        "any.required": "Vui lòng nhập mật khẩu mới!",
        "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự!"
    }),
    confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
        "any.only": "Xác nhận mật khẩu không khớp!",
        "any.required": "Vui lòng xác nhận mật khẩu!"
    })
});

module.exports.registerPost = validate(registerSchema);
module.exports.loginPost = validate(loginSchema);
module.exports.forgotPasswordPost = validate(forgotPasswordSchema);
module.exports.resetPasswordPost = validate(resetPasswordSchema);
module.exports.infoPost = validate(infoSchema);
module.exports.changePasswordPost = validate(changePasswordSchema);
