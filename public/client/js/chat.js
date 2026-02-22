// ===================== CHAT SOCKET CLIENT =====================
(function() {
    const chatForm = document.getElementById("chatForm");
    if (!chatForm) return; // Không ở trang chat thì bỏ qua

    const socket = io();

    const chatBody = document.getElementById("chatBody");
    const chatInput = document.getElementById("chatInput");
    const chatUserId = document.getElementById("chatUserId").value;
    const chatUserName = document.getElementById("chatUserName").value;
    const chatTyping = document.getElementById("chatTyping");
    const emojiBtn = document.getElementById("emojiBtn");
    const emojiPicker = document.getElementById("emojiPicker");

    // ---- Auto-scroll xuống cuối ----
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    scrollToBottom();

    // ---- Tạo HTML cho tin nhắn ----
    function createMessageHTML(data, isSelf) {
        const time = new Date(data.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });

        let filesHTML = "";
        if (data.images && data.images.length > 0) {
            filesHTML = '<div class="chat-msg-images">';
            data.images.forEach(function(fileUrl) {
                // Kiểm tra định dạng bằng cách extract đuôi file hoặc kiểm tra chữ "image"
                const ext = fileUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || fileUrl.includes("image");
                
                if (isImage) {
                    filesHTML += '<img class="chat-msg-img" src="' + fileUrl + '" alt="image">';
                } else {
                    // Nếu là file khác
                    let fileName = "Tài liệu đính kèm";
                    try {
                        let parts = fileUrl.split('/');
                        fileName = parts[parts.length - 1]; // Lấy tạm tên file trên URL
                    } catch(e) {}
                    
                    filesHTML += '<a class="chat-msg-file" href="' + fileUrl + '" target="_blank" download>' +
                                    '<i class="fas fa-file-download mr-1"></i> ' + fileName + 
                                 '</a>';
                }
            });
            filesHTML += '</div>';
        }

        if (isSelf) {
            return '<div class="chat-message chat-message-self" data-user-id="' + data.userId + '">' +
                '<div class="chat-bubble-self">' +
                    '<div class="chat-msg-content">' + escapeHTML(data.content) + '</div>' +
                    filesHTML +
                    '<div class="chat-msg-time">' + time + '</div>' +
                '</div>' +
            '</div>';
        } else {
            var avatarHTML = data.avatar
                ? '<img class="chat-avatar" src="' + data.avatar + '" alt="avatar">'
                : '<div class="chat-avatar-placeholder"><i class="fas fa-user"></i></div>';

            return '<div class="chat-message chat-message-other" data-user-id="' + data.userId + '">' +
                '<div class="chat-avatar-wrap">' + avatarHTML + '</div>' +
                '<div class="chat-bubble-other">' +
                    '<div class="chat-msg-sender">' + escapeHTML(data.fullName) + '</div>' +
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

    // ---- File Upload with Preview (Gửi ảnh) ----
    let upload;
    if (typeof FileUploadWithPreview !== 'undefined') {
        upload = new FileUploadWithPreview.FileUploadWithPreview('chat-upload', {
            multiple: true,
            maxFileCount: 6,
            text: {
                chooseFile: '...', // Giấu label gốc để dùng Icon
                browse: 'Chọn ảnh',
                selectedCount: 'hình ảnh được chọn',
            }
        });

        // Tự động gán UI: hiện container khi có file được chọn
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

        // Ẩn UI khi click clear tất cả
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

    // ---- Gửi tin nhắn ----
    chatForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        var content = chatInput.value.trim();
        
        // Kiểm tra xem có ảnh hoặc nội dung không
        var hasImages = upload && upload.cachedFileArray && upload.cachedFileArray.length > 0;
        if (!content && !hasImages) return;

        // Xử lý nén ảnh/đọc ảnh sang Base64/Buffer để gửi thẳng qua socket
        let imagesBuffer = [];
        if (hasImages) {
            for (let file of upload.cachedFileArray) {
                // Đọc file thành base64 để socket push đi
                const base64 = await readFileAsBase64(file);
                imagesBuffer.push(base64);
            }
        }

        socket.emit("CLIENT_SEND_MESSAGE", {
            userId: chatUserId,
            content: content,
            images: imagesBuffer
        });

        chatInput.value = "";
        
        // Clear ảnh
        if (hasImages) {
            upload.clearPreviewPanel();
            document.querySelector('.custom-file-container').classList.remove('is-active');
        }
        
        chatInput.focus();

        // Ẩn typing
        socket.emit("CLIENT_SEND_TYPING", {
            userId: chatUserId,
            fullName: chatUserName,
            type: "hide"
        });
    });

    // Helper reader Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // ---- Nhận tin nhắn từ server ----
    socket.on("SERVER_RETURN_MESSAGE", function(data) {
        var isSelf = (data.userId === chatUserId);
        var html = createMessageHTML(data, isSelf);

        // Xoá thông báo "chưa có tin nhắn" nếu có
        var empty = chatBody.querySelector(".chat-empty");
        if (empty) empty.remove();

        chatBody.insertAdjacentHTML("beforeend", html);
        scrollToBottom();
    });

    // ---- Typing indicator ----
    var typingTimeout;
    chatInput.addEventListener("input", function() {
        socket.emit("CLIENT_SEND_TYPING", {
            userId: chatUserId,
            fullName: chatUserName,
            type: "show"
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(function() {
            socket.emit("CLIENT_SEND_TYPING", {
                userId: chatUserId,
                fullName: chatUserName,
                type: "hide"
            });
        }, 2000);
    });

    socket.on("SERVER_RETURN_TYPING", function(data) {
        var typingText = chatTyping.querySelector(".chat-typing-text");
        if (data.type === "show") {
            typingText.innerHTML = '<i class="fas fa-ellipsis-h fa-beat"></i> ' + escapeHTML(data.fullName) + ' đang nhập...';
            chatTyping.classList.add("active");
        } else {
            typingText.innerHTML = '';
            chatTyping.classList.remove("active");
        }
    });

    // ---- Emoji picker (Sử dụng emoji-picker-element) ----
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

    // Đóng emoji picker khi click ngoài
    document.addEventListener("click", function(e) {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
            emojiPicker.classList.remove("show");
        }
    });
})();
