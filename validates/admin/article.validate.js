const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const articleSchema = Joi.object({
    title: Joi.string().trim().min(5).max(200).required().messages({
        "string.empty": "Tiêu đề bài viết không được để trống.",
        "any.required": "Tiêu đề bài viết không được để trống.",
        "string.min": "Tiêu đề bài viết phải có ít nhất {#limit} ký tự.",
        "string.max": "Tiêu đề bài viết không được vượt quá {#limit} ký tự."
    })
});

module.exports.createPost = validate(articleSchema);
module.exports.editPatch = validate(articleSchema);
