const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        room_chat_id: {
            type: String,
            required: true
        },
        sender_id: {
            type: String, /* Có thể là User_id hoặc Account_id nên lưu dạng chuỗi cho đỡ rối Ref */
            required: true
        },
        sender_type: {
            type: String, /* "user" hoặc "admin" */
            required: true
        },
        content: String,
        images: [String],
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

const Chat = mongoose.model("Chat", chatSchema, "chats");

module.exports = Chat;
