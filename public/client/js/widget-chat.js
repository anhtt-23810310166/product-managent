// ===================== WIDGET CHAT CLIENT SOCKET =====================
(function() {
    // Các phần tử giao diện dùng chung
    const chatWidgetTrigger = document.getElementById("chatWidgetTrigger");
    const chatWidgetBox = document.getElementById("chatWidgetBox");
    const chatWidgetClose = document.getElementById("chatWidgetClose");
    
    // Nếu không có phần tử DOM thì dừng hẳn
    if(!chatWidgetTrigger) return;

    // ---- LOGIC ĐÓNG MỞ WIDGET (Dành cho tất cả mọi người) ----
    let isWidgetOpened = false;

    chatWidgetTrigger.addEventListener("click", async () => {
        chatWidgetBox.classList.remove("d-none"); // Mở widget
        chatWidgetTrigger.classList.add("d-none"); // Ẩn bong bóng nổi
        
        // --- CHỈ XỬ LÝ CHAT NẾU ĐÃ ĐĂNG NHẬP ---
        if (document.getElementById("chatUserId")) {
            await initLoggedUserChat();
        }
    });

    chatWidgetClose.addEventListener("click", () => {
        chatWidgetBox.classList.add("d-none");    // Đóng widget
        chatWidgetTrigger.classList.remove("d-none"); // Hiện lại bong bóng nổi
    });

    // --- LOGIC XỬ LÝ CHAT BÊN DƯỚI (Chỉ chạy khi đã đăng nhập) ---
    const chatUserIdInput = document.getElementById("chatUserId");
    if (!chatUserIdInput) return; // Nếu khách vãng lai -> Dừng phần setup JS Chat ở đây

    // --- Biến State (Đã Đăng Nhập) ---
    const socket = io();
    let roomChatId = "";
    const chatUserId = chatUserIdInput.value;
    const chatUserName = document.getElementById("chatUserName").value;
    
    const chatBody = document.getElementById("chatBody");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const emojiBtn = document.getElementById("emojiBtn");
    const emojiPicker = document.getElementById("emojiPicker");

    // Khởi tạo Chat khi mở khung
    async function initLoggedUserChat() {
        if (isWidgetOpened) return; // Đã load rồi thì không load lại
        
        try {
            const response = await fetch("/chat/history"); 
            const data = await response.json();
            
            if(data.code === 200) {
                roomChatId = data.roomChatId;
                
                // Xóa spinner loading
                chatBody.innerHTML = "";
                
                if(data.chats && data.chats.length > 0) {
                    data.chats.forEach(chat => {
                        const isSelf = (chat.sender_type === "user");
                        const html = createMessageHTML(chat, isSelf);
                        chatBody.insertAdjacentHTML("beforeend", html);
                    });
                } else {
                    chatBody.innerHTML = `
                        <div class="text-center text-muted mt-5 chat-empty">
                            <i class="far fa-comment-dots fa-3x mb-3"></i>
                            <p>Hỗ trợ CSKH 24/7. Hãy dể lại lời nhắn!</p>
                        </div>
                    `;
                }
                scrollToBottom();
                
                // Phát Socket tham gia Private Room vào Server Node
                socket.emit("CLIENT_JOIN_ROOM", roomChatId);
                    
                    // Đánh dấu đã load xong dữ liệu
                    isWidgetOpened = true;
                }
            } catch (error) {
                console.log("Error loading chat:", error);
                chatBody.innerHTML = `<div class="p-3 text-center text-danger">Lỗi kết nối. Vui lòng thử lại sau.</div>`;
            }
        }
    
    // Nút tắt bóng chat bên ngoài menu Header
    const btnOpenChatHeader = document.querySelector(".btn-open-chat");
    if(btnOpenChatHeader) {
        btnOpenChatHeader.addEventListener("click", (e) => {
            e.preventDefault();
            chatWidgetTrigger.click(); // Giả lập bấm bóng dưới gốc màn hình
        });
    }

    // ---- AUTO-SCROLL ----
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ---- RENDER HTML MỘT TIN NHẮN DỰA THEO CLASS CÓ SẴN TRONG STYLE.CSS ----
    function createMessageHTML(data, isSelf) {
        const time = new Date(data.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });

        let filesHTML = "";
        if (data.images && data.images.length > 0) {
            filesHTML = '<div class="chat-msg-images">';
            data.images.forEach(function(fileUrl) {
                // Kiểm tra có phải ảnh hay không bằng đuôi
                const ext = fileUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || fileUrl.includes("image");
                
                if (isImage) {
                    filesHTML += '<img class="chat-msg-img" src="' + fileUrl + '" alt="image" onclick="window.open(this.src)">';
                } else {
                    let fileName = "Tài liệu đính kèm";
                    try { fileName = fileUrl.split('/').pop(); } catch(e) {}
                    
                    filesHTML += '<a class="chat-msg-file" href="' + fileUrl + '" target="_blank" download>' +
                                    '<i class="fas fa-file-download mr-1"></i> ' + fileName + 
                                 '</a>';
                }
            });
            filesHTML += '</div>';
        }

        if (isSelf) {
            return '<div class="chat-message chat-message-self" data-sender-id="' + data.sender_id + '">' +
                '<div class="chat-bubble-self">' +
                    '<div class="chat-msg-content">' + escapeHTML(data.content) + '</div>' +
                    filesHTML +
                    '<div class="chat-msg-time">' + time + '</div>' +
                '</div>' +
            '</div>';
        } else {
            return '<div class="chat-message chat-message-other" data-sender-id="' + data.sender_id + '">' +
                '<div class="chat-avatar-wrap">' + 
                    '<div class="chat-avatar-placeholder" style="background: var(--shopee-orange); color: white;"><i class="fas fa-headset"></i></div>' +
                '</div>' +
                '<div class="chat-bubble-other">' +
                    '<div class="chat-msg-sender">CSKH</div>' +
                    '<div class="chat-msg-content">' + escapeHTML(data.content) + '</div>' +
                    filesHTML +
                    '<div class="chat-msg-time">' + time + '</div>' +
                '</div>' +
            '</div>';
        }
    }

    function escapeHTML(str) {
        if (!str) return "";
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- INIT THƯ VIỆN ẢNH ----
    let upload;
    if (typeof FileUploadWithPreview !== 'undefined') {
        upload = new FileUploadWithPreview.FileUploadWithPreview('chat-upload', {
            multiple: true,
            maxFileCount: 6,
            text: {
                chooseFile: '...', browse: 'Chọn ảnh', selectedCount: 'hình ảnh được chọn',
            }
        });

        const uploadContainer = document.querySelector('.custom-file-container');
        const fileInput = document.getElementById('file-upload-with-preview-chat-upload');
        fileInput.addEventListener('change', function() {
            setTimeout(() => {
                if (upload.cachedFileArray && upload.cachedFileArray.length > 0) {
                    uploadContainer.classList.add('is-active');
                } else {
                    uploadContainer.classList.remove('is-active');
                }
            }, 100);
        });

        uploadContainer.addEventListener('click', function(e) {
            if (e.target.closest('.image-preview-item-clear') || e.target.closest('.custom-file-container__image-clear')) {
                setTimeout(() => {
                    if (upload.cachedFileArray.length === 0) {
                        uploadContainer.classList.remove('is-active');
                    }
                }, 100);
            }
        });
    }

    // ---- GỬI TIN NHẮN (SUBMIT FORM) ----
    chatForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        var content = chatInput.value.trim();
        
        var hasImages = upload && upload.cachedFileArray && upload.cachedFileArray.length > 0;
        if (!content && !hasImages) return;

        let imagesBuffer = [];
        if (hasImages) {
            for (let file of upload.cachedFileArray) {
                const base64 = await readFileAsBase64(file);
                imagesBuffer.push(base64);
            }
        }

        // Bắn Socket đi
        socket.emit("CLIENT_SEND_MESSAGE", {
            roomChatId: roomChatId,
            userId: chatUserId,
            content: content,
            images: imagesBuffer
        });

        chatInput.value = "";
        chatInput.focus();
        
        socket.emit("CLIENT_SEND_TYPING", {
            roomChatId: roomChatId,
            userId: chatUserId,
            fullName: chatUserName,
            type: "hide"
        });
        
        if (hasImages) {
            upload.clearPreviewPanel();
            document.querySelector('.custom-file-container').classList.remove('is-active');
        }
    });

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // ---- LẮNG NGHE TIN NHẮN MỚI TỪ SERVER ----
    socket.on("SERVER_RETURN_MESSAGE", function(data) {
        var isSelf = (data.sender_type === "user");
        var html = createMessageHTML(data, isSelf);

        var empty = chatBody.querySelector(".chat-empty");
        if (empty) empty.remove();

        chatBody.insertAdjacentHTML("beforeend", html);
        scrollToBottom();
        
        // Cập nhật Badge đỏ bên ngoài Bong bóng nếu đang ẩn Chat và đó là tin Admin gọi
        if(!isSelf && chatWidgetBox.classList.contains("d-none")) {
           const badge = document.querySelector(".chat-badge");
           if(badge) {
               badge.classList.remove("d-none");
               badge.textContent = parseInt(badge.textContent || 0) + 1;
           }
        }
    });

    // Reset badge khi Click mở hộp
    chatWidgetTrigger.addEventListener("click", () => {
        const badge = document.querySelector(".chat-badge");
        if(badge) {
            badge.classList.add("d-none");
            badge.textContent = "0";
        }
    });

    // ---- EMOJI PICKER ----
    const picker = document.querySelector('emoji-picker');
    emojiBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        emojiPicker.classList.toggle("show");
    });

    if (picker) {
        picker.addEventListener('emoji-click', event => {
            const cursorPosition = chatInput.selectionEnd;
            const textLeft = chatInput.value.substring(0, cursorPosition);
            const textRight = chatInput.value.substring(cursorPosition, chatInput.value.length);
            
            chatInput.value = textLeft + event.detail.unicode + textRight;
            chatInput.focus();
            
            const newCursorPos = cursorPosition + event.detail.unicode.length;
            chatInput.setSelectionRange(newCursorPos, newCursorPos);
        });
    }

    document.addEventListener("click", function(e) {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
            emojiPicker.classList.remove("show");
        }
    });

    // ---- TYPING INDICATOR ----
    var typingTimeout;
    
    // Khi Khách hàng gõ phím
    chatInput.addEventListener("input", function() {
        if(!roomChatId) return;
        
        socket.emit("CLIENT_SEND_TYPING", {
            roomChatId: roomChatId,
            userId: chatUserId,
            fullName: chatUserName,
            type: "show"
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(function() {
            socket.emit("CLIENT_SEND_TYPING", {
                roomChatId: roomChatId,
                userId: chatUserId,
                fullName: chatUserName,
                type: "hide"
            });
        }, 2000);
    });

    // Khi nhận thông báo Admin đang gõ
    socket.on("SERVER_RETURN_TYPING", function(data) {
        if(data.sender_type === "admin") {
            const typingDiv = document.querySelector(".chat-typing");
            if(!typingDiv) {
                // Thêm html node typing vào dưới danh sách tin nhắn nếu chưa có
                const typingHtml = `
                    <div class="chat-typing mt-2 mb-2 p-2 bg-light rounded shadow-sm d-inline-block" style="display: none; font-size: 13px;">
                        <span class="chat-typing-text text-muted"></span>
                    </div>
                `;
                chatBody.insertAdjacentHTML("beforeend", typingHtml);
            }
            
            const typingText = document.querySelector(".chat-typing .chat-typing-text");
            const typingWrapper = document.querySelector(".chat-typing");

            if (data.type === "show") {
                const whoTyping = "CSKH";
                typingText.innerHTML = '<i class="fas fa-ellipsis-h fa-beat mr-1"></i> ' + whoTyping + ' đang nhập...';
                typingWrapper.style.display = "block";
                scrollToBottom();
            } else {
                typingText.innerHTML = '';
                typingWrapper.style.display = "none";
            }
        }
    });
})();
