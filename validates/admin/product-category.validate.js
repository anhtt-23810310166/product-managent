const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const categorySchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Tên danh mục không được để trống!",
        "any.required": "Tên danh mục không được để trống!"
    }),
    position: Joi.number().min(1).allow("", null).messages({
        "number.base": "Vị trí phải là số >= 1!",
        "number.min": "Vị trí phải là số >= 1!"
    })
});

module.exports.createPost = validate(categorySchema);
module.exports.editPatch = validate(categorySchema);
