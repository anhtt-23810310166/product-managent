const Chat = require("../../models/chat.model");
const cloudinary = require("../../config/cloudinary");

module.exports = (io) => {
    io.on("connection", (socket) => {
        // ----- Tham gia phòng kín (Room Private) -----
        socket.on("CLIENT_JOIN_ROOM", (roomChatId) => {
            if(roomChatId) socket.join(roomChatId);
        });

        // ----- Client gửi tin nhắn -----
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {
            try {
                let uploadedImages = [];
                
                // Nếu có file base64 gửi lên
                if (data.images && data.images.length > 0) {
                    for (const imageBase64 of data.images) {
                        const result = await cloudinary.uploader.upload(imageBase64, {
                            folder: "product-management/chat",
                            resource_type: "auto"
                        });
                        if (result && result.secure_url) {
                            uploadedImages.push(result.secure_url);
                        }
                    }
                }

                // Lưu vào Database với Model Chat mới
                const chat = new Chat({
                    room_chat_id: data.roomChatId,
                    sender_id: data.userId,
                    sender_type: "user", // Phía Khách hàng luôn là user gửi
                    content: data.content,
                    images: uploadedImages
                });
                await chat.save();

                // Phát tin nhắn cho RIÊNG phòng chat đó
                io.to(data.roomChatId).emit("SERVER_RETURN_MESSAGE", {
                    roomChatId: data.roomChatId,
                    sender_id: data.userId,
                    sender_type: "user",
                    content: data.content,
                    images: uploadedImages,
                    createdAt: chat.createdAt
                });
            } catch (error) {
                console.log("Socket chat error:", error);
            }
        });

        // ----- Typing indicator -----
        socket.on("CLIENT_SEND_TYPING", (data) => {
            // Broadcast cho người CÒN LẠI TRONG PHÒNG hiện tại
            if(data.roomChatId) {
                socket.to(data.roomChatId).emit("SERVER_RETURN_TYPING", {
                    sender_type: "user",
                    type: data.type // "show" hoặc "hide"
                });
            }
        });

        // ============================================
        // ----- ADMIN Gửi tin nhắn -----
        // ============================================
        socket.on("ADMIN_SEND_MESSAGE", async (data) => {
            try {
                // Admin hiện tại gửi bằng text thuần tuý
                const chat = new Chat({
                    room_chat_id: data.roomChatId,
                    sender_id: data.userId || "admin",
                    sender_type: "admin", // Đánh dấu là tin nhắn của CSKH
                    content: data.content,
                    images: data.images || []
                });
                await chat.save();

                io.to(data.roomChatId).emit("SERVER_RETURN_MESSAGE", {
                    roomChatId: data.roomChatId,
                    sender_id: chat.sender_id,
                    sender_type: "admin",
                    content: data.content,
                    images: chat.images,
                    createdAt: chat.createdAt
                });
            } catch (error) {
                console.log("Admin socket chat error:", error);
            }
        });

        // ----- ADMIN Typing indicator -----
        socket.on("ADMIN_SEND_TYPING", (data) => {
            if(data.roomChatId) {
                socket.to(data.roomChatId).emit("SERVER_RETURN_TYPING", {
                    sender_type: "admin",
                    type: data.type
                });
            }
        });

    });
};
