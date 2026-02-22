const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const cloudinary = require("../../config/cloudinary");

module.exports = (io) => {
    io.on("connection", (socket) => {
        // ----- Client gửi tin nhắn -----
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {
            try {
                // data = { userId, content, images }
                let uploadedImages = [];
                
                // Nếu có file base64 gửi lên
                if (data.images && data.images.length > 0) {
                    for (const imageBase64 of data.images) {
                        const result = await cloudinary.uploader.upload(imageBase64, {
                            folder: "product-management/chat",
                            resource_type: "auto" // Hỗ trợ cả file raw (pdf, docx, zip...) ngoài image, video
                        });
                        if (result && result.secure_url) {
                            uploadedImages.push(result.secure_url);
                        }
                    }
                }

                // Lưu vào Database
                const chat = new Chat({
                    user_id: data.userId,
                    content: data.content,
                    images: uploadedImages
                });
                await chat.save();

                // Lấy thông tin user để gửi kèm
                const user = await User.findById(data.userId).select("fullName avatar");

                // Phát tin nhắn cho TẤT CẢ client (bao gồm cả người gửi)
                io.emit("SERVER_RETURN_MESSAGE", {
                    userId: data.userId,
                    fullName: user ? user.fullName : "Ẩn danh",
                    avatar: user ? user.avatar : "",
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
            // Broadcast cho tất cả NGOẠI TRỪ người gửi
            socket.broadcast.emit("SERVER_RETURN_TYPING", {
                userId: data.userId,
                fullName: data.fullName,
                type: data.type // "show" hoặc "hide"
            });
        });
    });
};
