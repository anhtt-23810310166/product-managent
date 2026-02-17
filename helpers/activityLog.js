const ActivityLog = require("../models/activity-log.model");

/**
 * Ghi log hoạt động (fire-and-forget, không await)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Object} options
 * @param {string} options.action - create | edit | delete | change-status | login | logout | change-multi | permissions
 * @param {string} options.module - products | product-category | accounts | roles | auth
 * @param {string} options.description - Mô tả chi tiết
 * @param {Object} [options.data] - Dữ liệu bổ sung (optional)
 */
const createLog = (req, res, { action, module, description, data = {} }) => {
    const accountId = res.locals.user ? res.locals.user._id : "";
    const accountFullName = res.locals.user ? res.locals.user.fullName : "Hệ thống";
    const ip = req.ip || req.headers["x-forwarded-for"] || "";

    ActivityLog.create({
        accountId,
        accountFullName,
        action,
        module,
        description,
        data,
        ip
    }).catch(err => console.log("Activity Log Error:", err));
};

module.exports = createLog;
