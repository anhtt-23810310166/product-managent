const Chat = require("../../models/chat.model");

// [GET] /chat
module.exports.index = async (req, res) => {
    // Lấy 50 tin nhắn gần nhất, populate thông tin user
    const chats = await Chat.find({ deleted: false })
        .sort({ createdAt: "asc" })
        .limit(50)
        .populate("user_id", "fullName avatar");

    res.render("client/pages/chat/index", {
        title: "Chat",
        chats: chats
    });
};
