const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const productSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Tên sản phẩm không được để trống!",
        "any.required": "Tên sản phẩm không được để trống!"
    }),
    price: Joi.number().min(0).allow("", null).messages({
        "number.base": "Giá sản phẩm phải là số >= 0!",
        "number.min": "Giá sản phẩm phải là số >= 0!"
    }),
    discountPercentage: Joi.number().min(0).max(100).allow("", null).messages({
        "number.base": "Giảm giá phải từ 0 đến 100!",
        "number.min": "Giảm giá phải từ 0 đến 100!",
        "number.max": "Giảm giá phải từ 0 đến 100!"
    }),
    stock: Joi.number().min(0).allow("", null).messages({
        "number.base": "Số lượng phải là số >= 0!",
        "number.min": "Số lượng phải là số >= 0!"
    }),
    position: Joi.number().min(1).allow("", null).messages({
        "number.base": "Vị trí phải là số >= 1!",
        "number.min": "Vị trí phải là số >= 1!"
    })
});

module.exports.createPost = validate(productSchema);
module.exports.editPatch = validate(productSchema);
