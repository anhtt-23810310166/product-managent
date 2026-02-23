/**
 * Validation Middleware
 * Validate required fields và format cơ bản cho req.body.
 * Dùng như: router.post("/create", validate(rules), controller.createPost)
 *
 * @param {Object[]} rules - Mảng validation rules
 * @param {string} rules[].field - Tên field
 * @param {string} rules[].label - Label hiển thị lỗi (tiếng Việt)
 * @param {boolean} [rules[].required] - Bắt buộc nhập
 * @param {number} [rules[].minLength] - Chiều dài tối thiểu
 * @param {number} [rules[].maxLength] - Chiều dài tối đa
 * @param {string} [rules[].type] - Kiểu dữ liệu: "email", "number"
 * @param {number} [rules[].min] - Giá trị tối thiểu (cho number)
 * @returns {Function} Express middleware
 */
module.exports = function validate(rules) {
    return (req, res, next) => {
        const errors = [];

        for (const rule of rules) {
            const value = req.body[rule.field];
            const label = rule.label || rule.field;

            // Required check
            if (rule.required) {
                if (value === undefined || value === null || value === "" || (typeof value === "string" && value.trim() === "")) {
                    errors.push(`${label} không được để trống.`);
                    continue;
                }
            }

            // Skip further checks if value is empty and not required
            if (value === undefined || value === null || value === "") {
                continue;
            }

            const strValue = String(value);

            // Min length
            if (rule.minLength && strValue.length < rule.minLength) {
                errors.push(`${label} phải có ít nhất ${rule.minLength} ký tự.`);
            }

            // Max length
            if (rule.maxLength && strValue.length > rule.maxLength) {
                errors.push(`${label} không được vượt quá ${rule.maxLength} ký tự.`);
            }

            // Type: email
            if (rule.type === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(strValue)) {
                    errors.push(`${label} không đúng định dạng email.`);
                }
            }

            // Type: number
            if (rule.type === "number") {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    errors.push(`${label} phải là số.`);
                } else if (rule.min !== undefined && numValue < rule.min) {
                    errors.push(`${label} phải lớn hơn hoặc bằng ${rule.min}.`);
                }
            }
        }

        if (errors.length > 0) {
            // AJAX requests → JSON response
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(400).json({
                    code: 400,
                    message: errors[0],
                    errors: errors
                });
            }

            // Regular requests → flash + redirect back
            req.flash("error", errors[0]);
            return res.redirect("back");
        }

        next();
    };
};
