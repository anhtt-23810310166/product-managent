const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const brandSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "Tên thương hiệu không được để trống.",
        "any.required": "Tên thương hiệu không được để trống.",
        "string.min": "Tên thương hiệu phải có ít nhất {#limit} ký tự.",
        "string.max": "Tên thương hiệu không được vượt quá {#limit} ký tự."
    })
});

module.exports.createPost = validate(brandSchema);
module.exports.editPatch = validate(brandSchema);
