const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

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

module.exports.loginPost = validate(loginSchema);
