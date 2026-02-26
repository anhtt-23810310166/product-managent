const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

// Schema tạo tài khoản
const createSchema = Joi.object({
    fullName: Joi.string().trim().required().messages({
        "string.empty": "Họ tên không được để trống!",
        "any.required": "Họ tên không được để trống!"
    }),
    email: Joi.string().trim().email().required().messages({
        "string.empty": "Email không được để trống!",
        "any.required": "Email không được để trống!",
        "string.email": "Email không đúng định dạng!"
    }),
    password: Joi.string().trim().required().messages({
        "string.empty": "Mật khẩu không được để trống!",
        "any.required": "Mật khẩu không được để trống!"
    })
});

// Schema chỉnh sửa tài khoản (không bắt buộc password)
const editSchema = Joi.object({
    fullName: Joi.string().trim().required().messages({
        "string.empty": "Họ tên không được để trống!",
        "any.required": "Họ tên không được để trống!"
    }),
    email: Joi.string().trim().email().required().messages({
        "string.empty": "Email không được để trống!",
        "any.required": "Email không được để trống!",
        "string.email": "Email không đúng định dạng!"
    })
});

module.exports.createPost = validate(createSchema);
module.exports.editPatch = validate(editSchema);
