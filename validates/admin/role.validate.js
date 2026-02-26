const Joi = require("joi");
const validate = require("../../middlewares/validate.middleware");

const roleSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Tên nhóm quyền không được để trống!",
        "any.required": "Tên nhóm quyền không được để trống!"
    })
});

module.exports.createPost = validate(roleSchema);
module.exports.editPatch = validate(roleSchema);

// permissionsPatch cần validate đặc biệt (JSON parse)
module.exports.permissionsPatch = (req, res, next) => {
    const schema = Joi.object({
        permissions: Joi.string().required().custom((value, helpers) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    return helpers.error("any.invalid");
                }
                return value;
            } catch (e) {
                return helpers.error("any.invalid");
            }
        }).messages({
            "string.empty": "Dữ liệu phân quyền không hợp lệ!",
            "any.required": "Dữ liệu phân quyền không hợp lệ!",
            "any.invalid": "Dữ liệu phân quyền không đúng định dạng!"
        })
    });

    const { error } = schema.validate(req.body, {
        abortEarly: true,
        allowUnknown: true
    });

    if (error) {
        const message = error.details[0].message;

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.status(400).json({
                code: 400,
                message: message,
                errors: error.details.map(d => d.message)
            });
        }

        req.flash("error", message);
        return res.redirect("back");
    }

    next();
};
