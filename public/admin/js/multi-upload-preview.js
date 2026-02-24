// ===== Multi-Image Upload Preview (Accumulative) =====
document.addEventListener("DOMContentLoaded", function () {
  var multiUploadFile = document.getElementById("multiUploadFile");
  var multiPreviewContainer = document.getElementById("multiPreviewContainer");

  if (!multiUploadFile || !multiPreviewContainer) return;

  // Lưu trữ tất cả file đã chọn (cộng dồn qua nhiều lần)
  var allFiles = [];

  multiUploadFile.addEventListener("change", function () {
    var newFiles = Array.from(this.files);

    // Thêm file mới vào danh sách (giới hạn 8 ảnh)
    for (var i = 0; i < newFiles.length; i++) {
      if (allFiles.length >= 8) break;
      if (!newFiles[i].type.startsWith("image/")) continue;
      allFiles.push(newFiles[i]);
    }

    // Cập nhật lại input files bằng DataTransfer
    var dt = new DataTransfer();
    allFiles.forEach(function (f) { dt.items.add(f); });
    multiUploadFile.files = dt.files;

    // Render lại toàn bộ preview
    renderPreviews();
  });

  function renderPreviews() {
    multiPreviewContainer.innerHTML = "";

    allFiles.forEach(function (file, idx) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var item = document.createElement("div");
        item.className = "multi-preview-item";
        item.innerHTML =
          '<img src="' + e.target.result + '" alt="' + file.name + '">' +
          '<span class="multi-preview-name">' + file.name + '</span>' +
          '<button type="button" class="multi-preview-remove" data-index="' + idx + '" title="Xóa ảnh này">&times;</button>';
        multiPreviewContainer.appendChild(item);

        // Nút xóa ảnh khỏi danh sách
        item.querySelector(".multi-preview-remove").addEventListener("click", function () {
          var removeIdx = parseInt(this.getAttribute("data-index"));
          allFiles.splice(removeIdx, 1);
          // Cập nhật lại input
          var dt = new DataTransfer();
          allFiles.forEach(function (f) { dt.items.add(f); });
          multiUploadFile.files = dt.files;
          renderPreviews();
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Existing image delete toggle (edit page)
  var removeButtons = document.querySelectorAll(".existing-image-remove");
  removeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = this.closest(".existing-image-item");
      var checkbox = this.querySelector("input[type=checkbox]");
      if (checkbox.checked) {
        checkbox.checked = false;
        item.classList.remove("marked-for-delete");
      } else {
        checkbox.checked = true;
        item.classList.add("marked-for-delete");
      }
    });
  });
});
