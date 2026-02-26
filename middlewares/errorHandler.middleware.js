/**
 * Global Error Handler Middleware
 * Bắt tất cả lỗi chưa được xử lý và trả response thống nhất.
 */

module.exports = (err, req, res, next) => {
    // Log lỗi cho developer (sau này thay bằng winston/pino)
    console.error(`\n[GLOBAL ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
    console.error(">>> ERROR DETAILS:", err);
    if (err.stack) console.error(">>> ERROR STACK:", err.stack);

    const statusCode = err.statusCode || 500;

    // Nếu là AJAX request → trả JSON
    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        return res.status(statusCode).json({
            code: statusCode,
            message: statusCode === 500
                ? "Có lỗi hệ thống xảy ra!"
                : (err.message || "Có lỗi xảy ra!")
        });
    }

    // Nếu là request thường → flash + redirect
    if (statusCode === 404) {
        return res.status(404).render("client/pages/errors/404", {
            pageTitle: "404 Not Found"
        });
    }

    req.flash("error", "Có lỗi hệ thống xảy ra!");
    res.redirect("back");
};
