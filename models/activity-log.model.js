const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        accountId: String,
        accountFullName: String,
        action: String,       // create | edit | delete | change-status | login | logout | change-multi | permissions
        module: String,       // products | product-category | accounts | roles | auth
        description: String,
        data: {
            type: Object,
            default: {}
        },
        ip: String
    },
    {
        timestamps: true
    }
);

// Indexes cho performance
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ accountId: 1, createdAt: -1 });

// TTL: tự động xoá log sau 90 ngày
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema, "activity-logs");

module.exports = ActivityLog;
