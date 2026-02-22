const RoomChat = require("../../models/room-chat.model");
const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");

// [GET] /admin/chat
module.exports.index = async (req, res) => {
    // Lấy danh sách tất cả các Room Chat đang active để render vào Cột Bên Trái
    const roomChats = await RoomChat.find({ deleted: false }).populate("user_id", "fullName avatar");

    res.render("admin/pages/chat/index", {
        pageTitle: "Hỗ trợ khách hàng",
        currentPage: "chat",
        roomChats: roomChats,
        activeRoom: null, // Chưa chọn room nào
        chats: [] // Chưa có tin nhắn
    });
};

// [GET] /admin/chat/:roomChatId
module.exports.detail = async (req, res) => {
    try {
        const roomChatId = req.params.roomChatId;
        
        // Vẫn phải lấy list room cho Cột Bên Trái
        const roomChats = await RoomChat.find({ deleted: false }).populate("user_id", "fullName avatar");
        
        // Lấy tin nhắn của room đã chọn cho Cột Bên Phải
        const chats = await Chat.find({ room_chat_id: roomChatId, deleted: false })
            .sort({ createdAt: "asc" })
            .limit(50);
            
        // Tìm thông tin khách hàng sở hữu room này
        const activeRoom = await RoomChat.findOne({ _id: roomChatId, deleted: false }).populate("user_id", "fullName avatar phone");

        if(!activeRoom) {
            return res.redirect(`${req.app.locals.prefixAdmin}/chat`);
        }

        res.render("admin/pages/chat/index", {
            pageTitle: `Trò chuyện cùng ${activeRoom.user_id.fullName}`,
            currentPage: "chat",
            roomChats: roomChats,
            activeRoom: activeRoom,
            chats: chats
        });
    } catch (error) {
        console.log(error);
        res.redirect(`${req.app.locals.prefixAdmin}/chat`);
    }
};
