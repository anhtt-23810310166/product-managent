// ===== Generic Admin CRUD Scripts =====
// File duy nhất xử lý: Change Status, Batch Actions, Soft Delete, Change Position
// cho TẤT CẢ entity (products, brands, articles, accounts, categories...).
//
// Cách dùng: Thêm attribute data-crud="<endpoint>" vào wrapper element.
// Ví dụ: .admin-list-wrapper(data-crud="/admin/products")
//
// Từ đó JS tự lấy endpoint và gọi đúng API.

(function () {
  var crudEl = document.querySelector("[data-crud]");
  if (!crudEl) return;

  var endpoint = crudEl.getAttribute("data-crud"); // e.g. "/admin/products"
  var entityName = crudEl.getAttribute("data-entity-name") || "mục"; // e.g. "sản phẩm"

  // Scope to document for finding elements (they may be in different containers)
  var scope = document;

  // ========== 1. Change Status ==========
  var statusButtons = scope.querySelectorAll(".btn-change-status");
  statusButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      var currentStatus = this.getAttribute("data-status");
      var newStatus = currentStatus === "active" ? "inactive" : "active";
      var self = this;
      var row = this.closest("tr");

      fetch(endpoint + "/change-status/" + newStatus + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.code === 200) {
            // Update button
            self.setAttribute("data-status", newStatus);
            self.textContent = newStatus === "active" ? "Dừng hoạt động" : "Hoạt động";

            // Update badge
            if (row) {
              var badge = row.querySelector(".status-badge");
              if (badge) {
                badge.textContent = newStatus === "active" ? "Hoạt động" : "Dừng hoạt động";
                badge.classList.toggle("status-active", newStatus === "active");
                badge.classList.toggle("status-inactive", newStatus !== "active");
              }
            }

            // Cascade UI update for descendants (product-category)
            if (data.descendantIds && data.descendantIds.length > 0) {
              data.descendantIds.forEach(function (descId) {
                var descBtn = wrapper.querySelector('.btn-change-status[data-id="' + descId + '"]');
                if (descBtn) {
                  descBtn.setAttribute("data-status", newStatus);
                  descBtn.textContent = newStatus === "active" ? "Dừng hoạt động" : "Hoạt động";
                  var descRow = descBtn.closest("tr");
                  if (descRow) {
                    var descBadge = descRow.querySelector(".status-badge");
                    if (descBadge) {
                      descBadge.textContent = newStatus === "active" ? "Hoạt động" : "Dừng hoạt động";
                      descBadge.classList.toggle("status-active", newStatus === "active");
                      descBadge.classList.toggle("status-inactive", newStatus !== "active");
                    }
                  }
                }
              });
            }

            if (!data.noChange) {
              showFlashMessage("success", data.message);
            }
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });

  // ========== 2. Batch Actions ==========
  var batchItems = scope.querySelectorAll(".batch-action-item");
  batchItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var action = this.getAttribute("data-action");
      var checkboxes = scope.querySelectorAll(".checkbox-item:checked");

      if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất một " + entityName + "!");
        return;
      }

      var ids = [];
      checkboxes.forEach(function (cb) {
        ids.push(cb.value);
      });

      var confirmMsg = "Bạn có chắc muốn thực hiện hành động này cho " + ids.length + " " + entityName + "?";
      if (action === "delete") {
        confirmMsg = "Bạn có chắc muốn xoá " + ids.length + " " + entityName + " đã chọn?";
      }

      if (!confirm(confirmMsg)) return;

      fetch(endpoint + "/change-multi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids, type: action })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            if (data.count > 0) {
              showFlashMessage("success", data.message);
            }
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });

  // ========== 3. Soft Delete Single Item ==========
  var deleteLinks = scope.querySelectorAll(".hover-action-danger");
  deleteLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xoá " + entityName + " này?")) return;

      fetch(endpoint + "/delete/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            var row = link.closest("tr");
            if (row) row.remove();
            if (!data.noChange) {
              showFlashMessage("success", data.message);
            }
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });

  // ========== 4. Change Position ==========
  var positionInputs = scope.querySelectorAll(".position-input");
  positionInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var id = this.getAttribute("data-id");
      var position = parseInt(this.value);

      if (!position || position < 1) {
        alert("Vị trí phải là số lớn hơn 0!");
        return;
      }

      fetch(endpoint + "/change-multi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: [{ id: id, position: position }],
          type: "change-position"
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            if (!data.noChange) {
              showFlashMessage("success", "Cập nhật vị trí thành công!");
            }
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });
})();
