const Joi = require("joi");

/**
 * Joi Validation Middleware
 * Nhận vào một Joi schema, validate req.body.
 * Nếu lỗi → flash message + redirect back (hoặc JSON cho AJAX).
 *
 * @param {Joi.ObjectSchema} schema - Joi schema object
 * @returns {Function} Express middleware
 */
module.exports = function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: true,
      allowUnknown: true,
      stripUnknown: false,
    });

    if (error) {
      const message = error.details[0].message;

      // AJAX requests → JSON response
      if (
        req.xhr ||
        (req.headers.accept && req.headers.accept.includes("application/json"))
      ) {
        return res.status(400).json({
          code: 400,
          message: message,
          errors: error.details.map((d) => d.message),
        });
      }

      // Regular requests → flash + redirect back
      req.flash("error", message);
      return res.redirect("back");
    }

    next();
  };
};
