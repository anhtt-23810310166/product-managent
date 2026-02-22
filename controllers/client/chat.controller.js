const Chat = require("../../models/chat.model");
const RoomChat = require("../../models/room-chat.model");

// [GET] /chat/history
module.exports.history = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        
        let roomChat = await RoomChat.findOne({ user_id: userId, typeRoom: "support", deleted: false });
        if (!roomChat) {
            roomChat = new RoomChat({
                user_id: userId,
                typeRoom: "support"
            });
            await roomChat.save();
        }

        const chats = await Chat.find({ room_chat_id: roomChat.id, deleted: false })
            .sort({ createdAt: "asc" })
            .limit(50);

        res.json({
            code: 200,
            roomChatId: roomChat.id,
            chats: chats
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi Server"
        });
    }
};
