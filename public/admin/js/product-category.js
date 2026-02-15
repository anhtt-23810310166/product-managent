// ===== Product Category Page Scripts =====

// Change Status
(function () {
  var buttons = document.querySelectorAll(".btn-change-status");
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      var currentStatus = this.getAttribute("data-status");
      var newStatus = currentStatus === "active" ? "inactive" : "active";
      var self = this;
      var row = this.closest("tr");

      fetch("/admin/product-category/change-status/" + newStatus + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.code === 200) {
            self.setAttribute("data-status", newStatus);
            if (newStatus === "active") {
              self.textContent = "Dừng hoạt động";
            } else {
              self.textContent = "Hoạt động";
            }

            if (row) {
              var badge = row.querySelector(".status-badge");
              if (badge) {
                if (newStatus === "active") {
                  badge.textContent = "Hoạt động";
                  badge.classList.remove("status-inactive");
                  badge.classList.add("status-active");
                } else {
                  badge.textContent = "Dừng hoạt động";
                  badge.classList.remove("status-active");
                  badge.classList.add("status-inactive");
                }
              }
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
})();

// Batch Action Handler
(function () {
  var batchItems = document.querySelectorAll(".batch-action-item");
  if (!batchItems.length) return;

  batchItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var action = this.getAttribute("data-action");
      var checkboxes = document.querySelectorAll(".checkbox-item:checked");

      if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất một danh mục!");
        return;
      }

      var ids = [];
      checkboxes.forEach(function (cb) {
        ids.push(cb.value);
      });

      var confirmMsg = "Bạn có chắc muốn thực hiện hành động này cho " + ids.length + " danh mục?";
      if (action === "delete") {
        confirmMsg = "Bạn có chắc muốn xoá " + ids.length + " danh mục đã chọn?";
      }

      if (!confirm(confirmMsg)) return;

      fetch("/admin/product-category/change-multi", {
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
})();

// Soft Delete Single Category
(function () {
  var deleteLinks = document.querySelectorAll(".hover-action-danger");
  if (!deleteLinks.length) return;

  deleteLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xoá danh mục này?")) return;

      fetch("/admin/product-category/delete/" + id, {
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
})();

// Change Position
(function () {
  var positionInputs = document.querySelectorAll(".position-input");
  if (!positionInputs.length) return;

  positionInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var id = this.getAttribute("data-id");
      var position = parseInt(this.value);

      if (!position || position < 1) {
        alert("Vị trí phải là số lớn hơn 0!");
        return;
      }

      fetch("/admin/product-category/change-multi", {
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
