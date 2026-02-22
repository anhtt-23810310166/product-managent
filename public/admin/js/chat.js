// ===================== CHAT SOCKET ADMIN =====================
(function() {
    const chatForm = document.getElementById("chatForm");
    if (!chatForm) return;

    const socket = io();

    const chatBody = document.getElementById("chatBody");
    const chatInput = document.getElementById("chatInput");
    const roomChatId = document.getElementById("roomChatId") ? document.getElementById("roomChatId").value : "";
    const chatTyping = document.getElementById("chatTyping");

    // ---- Join Room ngay khi kết nối vào trang Chat ----
    if (roomChatId) {
        socket.emit("CLIENT_JOIN_ROOM", roomChatId);
    }
    
    // Auto-scroll
    function scrollToBottom() {
        if(chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }
    scrollToBottom();

    // ---- Gửi tin nhắn ----
    chatForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var content = chatInput.value.trim();
        if (!content) return;

        socket.emit("ADMIN_SEND_MESSAGE", {
            roomChatId: roomChatId,
            userId: "admin_1", // Tạm để cố định, tuỳ chỉnh sau
            content: content,
            images: []
        });

        chatInput.value = "";
        chatInput.focus();

        socket.emit("ADMIN_SEND_TYPING", {
            roomChatId: roomChatId,
            type: "hide"
        });
    });

    // ---- Nhận tin nhắn từ server ----
    socket.on("SERVER_RETURN_MESSAGE", function(data) {
        // Chỉ render html nếu Server trả về đúng ID của phòng Admin đang xem
        if(data.roomChatId === roomChatId) {
            var isSelf = (data.sender_type === "admin");
            var time = new Date(data.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            var html = "";
            
              if (isSelf) {
                html = `
                  <div class="d-flex justify-content-end mb-3 chat-message chat-message-self" data-sender-id="${data.sender_id}">
                    <div class="bg-primary text-white p-2 shadow-sm" style="border-radius: 15px; max-width: 75%; border-top-right-radius: 0 !important;">
                      <p class="mb-1" style="word-wrap: break-word; font-size: 14px;">${escapeHTML(data.content)}</p>
                      <small class="text-white-50 d-block text-right" style="font-size: 0.75rem;">${time}</small>
                    </div>
                  </div>
                `;
            } else {
                html = `
                  <div class="d-flex justify-content-start mb-3 chat-message chat-message-other" data-sender-id="${data.sender_id}">
                    <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mr-2" style="width: 32px; height: 32px;">
                      <i class="fas fa-user fa-sm"></i>
                    </div>
                    <div class="bg-white p-2 shadow-sm border" style="border-radius: 15px; max-width: 75%; border-top-left-radius: 0 !important;">
                      <p class="mb-1" style="word-wrap: break-word; color: #1c1e21; font-size: 14px;">${escapeHTML(data.content)}</p>
                      <small class="text-muted d-block" style="font-size: 0.75rem;">${time}</small>
                    </div>
                  </div>
                `;
            }

            // Xóa message rỗng nếu có
            var empty = chatBody.querySelector(".chat-empty");
            if (empty) empty.remove();

            chatBody.insertAdjacentHTML("beforeend", html);
            scrollToBottom();
        } else {
            // Nếu có tin nhắn mới từ phòng khác, trong thực tế ta sẽ reload lại cái Navbar danh sách người chat trái
            // Để tin nhắn mới nảy lên trên cùng.
        }
    });

    // ---- Typing indicator ----
    var typingTimeout;
    chatInput.addEventListener("input", function() {
        socket.emit("ADMIN_SEND_TYPING", {
            roomChatId: roomChatId,
            type: "show"
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(function() {
            socket.emit("ADMIN_SEND_TYPING", {
                roomChatId: roomChatId,
                type: "hide"
            });
        }, 2000);
    });

    socket.on("SERVER_RETURN_TYPING", function(data) {
        if(data.type === "show" && data.sender_type === "user") {
            chatTyping.style.display = "block";
        } else {
            chatTyping.style.display = "none";
        }
    });

    function escapeHTML(str) {
        if (!str) return "";
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }
})();
