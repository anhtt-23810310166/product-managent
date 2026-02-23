const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        avatar: String,
        token: String,
        addresses: [
            {
                fullName: String,
                phone: String,
                address: String,
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        status: {
            type: String,
            default: "active"
        },
        otpPassword: String,
        otpPasswordTimeExpire: Date,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
