/**
 * Input Whitelist Middleware
 * Chống mass assignment bằng cách chỉ cho phép các field được khai báo.
 * Dùng như: router.post("/create", whitelist(["title", "description", "price"]), controller.createPost)
 *
 * @param {string[]} allowedFields - Danh sách field được phép
 * @returns {Function} Express middleware
 */
module.exports = function whitelist(allowedFields) {
    return (req, res, next) => {
        if (req.body && typeof req.body === "object") {
            const filtered = {};
            for (const key of allowedFields) {
                if (req.body[key] !== undefined) {
                    filtered[key] = req.body[key];
                }
            }
            req.body = filtered;
        }
        next();
    };
};
